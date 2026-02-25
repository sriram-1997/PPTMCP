import { normalizeColor } from "./utils/color.js";
import { ptToIn } from "./utils/units.js";
import { textUnits } from "./text.js";
import { normalizeText, parseBoldRuns } from "./utils/textRuns.js";
import { resolveIconData } from "./utils/icons.js";
import { hasValidCanonicalIndent, resolveCanonicalListMetrics } from "../typography/listMetrics.js";
import { resolveListRhythm } from "../typography/rhythm.js";
const DEFAULT_LINE_GAP_PT = 6;
const BASELINE_RATIO = 0.8;
function glyphUnits(char) {
    if (char === "\t") {
        return 4;
    }
    if (char === " ") {
        return 0.55;
    }
    const code = char.charCodeAt(0);
    if (code <= 0x007f) {
        return 1;
    }
    if (code <= 0x07ff) {
        return 1.35;
    }
    return 1.65;
}
function wrapLongToken(token, maxUnitsPerLine) {
    const chunks = [];
    let current = "";
    let currentUnits = 0;
    for (const char of token) {
        const charUnits = glyphUnits(char);
        if (current && currentUnits + charUnits > maxUnitsPerLine) {
            chunks.push(current);
            current = char;
            currentUnits = charUnits;
        }
        else {
            current += char;
            currentUnits += charUnits;
        }
    }
    if (current) {
        chunks.push(current);
    }
    return chunks.length > 0 ? chunks : [token];
}
function tokenizeRuns(runs) {
    const tokens = [];
    runs.forEach((run) => {
        const parts = run.text.split(/(\s+)/).filter((part) => part.length > 0);
        parts.forEach((part) => {
            const isSpace = /^\s+$/.test(part);
            tokens.push({ text: isSpace ? " " : part, bold: run.bold, isSpace });
        });
    });
    return tokens;
}
function tokensToRuns(tokens) {
    const runs = [];
    tokens.forEach((token) => {
        if (token.isSpace && runs.length === 0) {
            return;
        }
        if (token.isSpace && runs.length > 0 && runs[runs.length - 1].text.endsWith(" ")) {
            return;
        }
        const last = runs[runs.length - 1];
        if (last && last.bold === token.bold) {
            last.text += token.text;
        }
        else {
            runs.push({ text: token.text, bold: token.bold });
        }
    });
    while (runs.length > 0 && runs[runs.length - 1].text.trim() === "") {
        runs.pop();
    }
    return runs;
}
function splitRunsOnNewline(runs) {
    const paragraphs = [];
    let current = [];
    runs.forEach((run) => {
        const parts = run.text.split("\n");
        parts.forEach((part, idx) => {
            if (part.length > 0) {
                current.push({ text: part, bold: run.bold });
            }
            if (idx < parts.length - 1) {
                paragraphs.push(current);
                current = [];
            }
        });
    });
    paragraphs.push(current);
    return paragraphs;
}
function wrapRuns(runs, maxUnitsPerLine) {
    const tokens = tokenizeRuns(runs);
    const lines = [];
    let currentTokens = [];
    let currentUnits = 0;
    let pendingSpace = false;
    const pushLine = () => {
        const lineRuns = tokensToRuns(currentTokens);
        lines.push({ runs: lineRuns.length > 0 ? lineRuns : [{ text: "", bold: false }] });
        currentTokens = [];
        currentUnits = 0;
    };
    const addWordToken = (word, includeSpace) => {
        if (includeSpace) {
            const boldForSpace = currentTokens.length > 0 ? currentTokens[currentTokens.length - 1].bold : word.bold;
            currentTokens.push({ text: " ", bold: boldForSpace, isSpace: true });
            currentUnits += glyphUnits(" ");
        }
        currentTokens.push({ text: word.text, bold: word.bold, isSpace: false });
        currentUnits += textUnits(word.text);
    };
    for (const token of tokens) {
        if (token.isSpace) {
            pendingSpace = currentTokens.length > 0;
            continue;
        }
        const spaceUnits = pendingSpace && currentTokens.length > 0 ? glyphUnits(" ") : 0;
        const tokenUnits = textUnits(token.text);
        const candidateUnits = currentUnits + spaceUnits + tokenUnits;
        if (candidateUnits <= maxUnitsPerLine) {
            addWordToken(token, pendingSpace && currentTokens.length > 0);
            pendingSpace = false;
            continue;
        }
        if (currentTokens.length > 0) {
            pushLine();
            pendingSpace = false;
        }
        if (tokenUnits <= maxUnitsPerLine) {
            addWordToken(token, false);
            continue;
        }
        const chunks = wrapLongToken(token.text, Math.max(1, maxUnitsPerLine));
        chunks.forEach((chunk, idx) => {
            const chunkToken = { text: chunk, bold: token.bold, isSpace: false };
            if (idx < chunks.length - 1) {
                lines.push({ runs: [{ text: chunkToken.text, bold: chunkToken.bold }] });
            }
            else {
                currentTokens.push(chunkToken);
                currentUnits = textUnits(chunkToken.text);
            }
        });
    }
    if (currentTokens.length > 0 || lines.length === 0) {
        pushLine();
    }
    return lines;
}
function resolveBulletSize(size, theme) {
    const sm = theme.spaceScale[2] ?? 4;
    const md = theme.spaceScale[3] ?? 6;
    if (size === "sm") {
        return sm;
    }
    return md;
}
function resolveBulletColor(value, theme) {
    if (value === "muted") {
        return theme.text.colorSecondary;
    }
    return theme.text.colorPrimary;
}
function buildTextRuns(lines) {
    const output = [];
    lines.forEach((line, idx) => {
        line.runs.forEach((run) => output.push({ text: run.text, bold: run.bold }));
        if (idx < lines.length - 1) {
            output.push({ text: "\n", bold: false });
        }
    });
    return output;
}
export function layoutList(args) {
    const prefix = args.prefix ? `${args.prefix} ` : "";
    const style = args.list.style ?? "dot";
    if (!["dot", "number", "icon", "none"].includes(style)) {
        if (args.hardErrors) {
            args.hardErrors.push(`${prefix}invalid_bullet_style`);
        }
    }
    const canonicalMetrics = resolveCanonicalListMetrics(style);
    if (!hasValidCanonicalIndent(canonicalMetrics) && args.hardErrors) {
        args.hardErrors.push(`${prefix}list_indent_invalid`);
    }
    const bulletSizePt = resolveBulletSize(args.list.bullet?.size, args.theme);
    const bulletGapPt = canonicalMetrics.bulletGapPt;
    const bulletColor = normalizeColor(resolveBulletColor(args.list.bullet?.color, args.theme), args.theme.text.colorPrimary);
    const leftPt = canonicalMetrics.leftIndentPt;
    const hangingPt = canonicalMetrics.hangingPt;
    const lineGapPt = typeof args.list.lineGap === "number"
        ? args.list.lineGap
        : (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? DEFAULT_LINE_GAP_PT);
    if (hangingPt > leftPt + 0.1 && args.hardErrors) {
        args.hardErrors.push(`${prefix}list_indent_invalid`);
    }
    const textStartX = args.bbox.x + ptToIn(canonicalMetrics.textStartOffsetPt);
    const textBoxX = textStartX;
    const textWidthIn = args.bbox.width - ptToIn(canonicalMetrics.textStartOffsetPt);
    if (textWidthIn <= 0 && args.hardErrors) {
        args.hardErrors.push(`${prefix}list_indent_invalid`);
    }
    const fontFace = args.theme.fontScale.body.family;
    const fontSize = args.theme.fontScale.body.size;
    const rhythm = resolveListRhythm({ contextLabel: prefix.trim() || "list" });
    const lineHeight = rhythm.lineHeight;
    const lineHeightPt = fontSize * lineHeight;
    const baselineOffsetPt = Math.max(0, (lineHeightPt - fontSize) / 2 + fontSize * BASELINE_RATIO);
    const availableWidthPt = Math.max(1, textWidthIn * 72);
    const avgCharWidthPt = fontSize * 0.53;
    const maxUnitsPerLine = Math.max(1, Math.floor(availableWidthPt / avgCharWidthPt));
    let iconData = null;
    if (style === "icon") {
        const iconName = args.list.bullet?.icon;
        const bulletColorValue = args.list.bullet?.color;
        if (typeof bulletColorValue !== "undefined" && !["text", "muted"].includes(String(bulletColorValue))) {
            if (args.hardErrors) {
                args.hardErrors.push(`${prefix}list_icon_style_invalid`);
            }
        }
        if (!iconName || iconName.trim().length === 0) {
            if (args.hardErrors) {
                args.hardErrors.push(`${prefix}icon_not_found`);
            }
        }
        else {
            const iconResult = resolveIconData({ name: iconName, color: bulletColor });
            if (iconResult.error || !iconResult.data) {
                if (args.hardErrors) {
                    args.hardErrors.push(`${prefix}icon_not_found`);
                }
            }
            iconData = iconResult.data ?? null;
        }
    }
    let cursorY = args.bbox.y;
    const items = [];
    (args.list.items ?? []).forEach((item, idx) => {
        const normalized = normalizeText(item.text ?? "");
        const runs = parseBoldRuns(normalized);
        const paragraphs = splitRunsOnNewline(runs);
        const lines = [];
        paragraphs.forEach((paraRuns) => {
            const wrapped = wrapRuns(paraRuns, maxUnitsPerLine);
            if (wrapped.length === 0) {
                lines.push({ runs: [{ text: "", bold: false }] });
            }
            else {
                lines.push(...wrapped);
            }
        });
        const itemHeightPt = Math.max(lineHeightPt, lines.length * lineHeightPt);
        const itemHeightIn = itemHeightPt / 72;
        const textBox = {
            x: textStartX,
            y: cursorY,
            width: Math.max(0, textWidthIn),
            height: itemHeightIn,
        };
        let bullet;
        if (style === "dot") {
            const bulletSizeIn = ptToIn(bulletSizePt);
            const bulletLeft = textStartX - ptToIn(bulletGapPt + bulletSizePt);
            const baselineY = cursorY + ptToIn(baselineOffsetPt);
            const bulletY = baselineY - ptToIn(bulletSizePt / 2);
            const bulletBottom = bulletY + ptToIn(bulletSizePt);
            const lineBottom = cursorY + ptToIn(lineHeightPt);
            if ((bulletY < cursorY - 0.01 || bulletBottom > lineBottom + 0.01) && args.hardErrors) {
                args.hardErrors.push(`${prefix}list_alignment_invalid`);
            }
            bullet = {
                type: "dot",
                bbox: { x: bulletLeft, y: bulletY, width: bulletSizeIn, height: bulletSizeIn },
                color: bulletColor,
            };
        }
        else if (style === "icon") {
            const iconWidthPt = canonicalMetrics.iconBoxWidthPt;
            const iconWidthIn = ptToIn(iconWidthPt);
            const bulletLeft = textStartX - ptToIn(bulletGapPt + iconWidthPt);
            const baselineY = cursorY + ptToIn(baselineOffsetPt);
            const bulletY = baselineY -
                ptToIn(iconWidthPt / 2) +
                ptToIn(canonicalMetrics.iconBaselineNudgePt);
            const bulletBottom = bulletY + iconWidthIn;
            const lineBottom = cursorY + ptToIn(lineHeightPt);
            if ((bulletY < cursorY - 0.01 || bulletBottom > lineBottom + 0.01) && args.hardErrors) {
                args.hardErrors.push(`${prefix}list_alignment_invalid`);
            }
            bullet = {
                type: "icon",
                bbox: { x: bulletLeft, y: bulletY, width: iconWidthIn, height: iconWidthIn },
                color: bulletColor,
                data: iconData ?? "",
            };
        }
        else if (style === "number") {
            const numberPrefixWidthPt = canonicalMetrics.numberPrefixWidthPt;
            const numberLeft = textStartX - ptToIn(numberPrefixWidthPt + bulletGapPt);
            bullet = {
                type: "number",
                bbox: {
                    x: numberLeft,
                    y: cursorY,
                    width: ptToIn(numberPrefixWidthPt),
                    height: ptToIn(lineHeightPt),
                },
                color: bulletColor,
                text: `${idx + 1}.`,
            };
        }
        items.push({ textBox, lines, bullet });
        cursorY += itemHeightIn;
        if (idx < args.list.items.length - 1) {
            cursorY += ptToIn(lineGapPt);
        }
    });
    const totalHeightPt = (cursorY - args.bbox.y) * 72;
    const availableHeightPt = args.bbox.height * 72;
    if (args.enforceFit !== false && totalHeightPt > availableHeightPt + 0.2 && args.hardErrors) {
        args.hardErrors.push(`${prefix}list_overflow`);
    }
    return {
        bbox: {
            x: args.bbox.x,
            y: args.bbox.y,
            width: args.bbox.width,
            height: args.bbox.height,
        },
        items,
        textStyle: {
            fontFace,
            fontSize,
            color: normalizeColor(args.theme.text.colorPrimary, args.theme.text.colorPrimary),
            lineHeight,
        },
        bulletStyle: {
            style,
            sizePt: bulletSizePt,
            gapPt: bulletGapPt,
            color: bulletColor,
        },
        totalHeightPt,
        metrics: {
            textStartX,
            textBoxX,
            hangingPt,
            leftPt,
            numberedInline: false,
        },
    };
}
export function prepareListElement(args) {
    const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
    const layout = layoutList({
        list: args.element,
        bbox: args.bbox,
        theme: args.theme,
        hardErrors: args.hardErrors,
        prefix,
        enforceFit: true,
    });
    return {
        kind: "list",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        ...layout,
    };
}
export function renderListLayout(slide, shapeType, layout, overrides) {
    const fontFace = overrides?.fontFace ?? layout.textStyle.fontFace;
    const fontSize = overrides?.fontSize ?? layout.textStyle.fontSize;
    const color = overrides?.color ?? layout.textStyle.color;
    layout.items.forEach((item) => {
        if (item.bullet) {
            if (item.bullet.type === "dot") {
                slide.addShape(shapeType.ellipse, {
                    x: item.bullet.bbox.x,
                    y: item.bullet.bbox.y,
                    w: item.bullet.bbox.width,
                    h: item.bullet.bbox.height,
                    fill: { color: item.bullet.color },
                    line: { color: item.bullet.color, width: 0 },
                });
            }
            else if (item.bullet.type === "icon" && item.bullet.data) {
                slide.addImage({
                    data: item.bullet.data,
                    x: item.bullet.bbox.x,
                    y: item.bullet.bbox.y,
                    w: item.bullet.bbox.width,
                    h: item.bullet.bbox.height,
                });
            }
            else if (item.bullet.type === "number" && item.bullet.text) {
                slide.addText(item.bullet.text, {
                    x: item.bullet.bbox.x,
                    y: item.bullet.bbox.y,
                    w: item.bullet.bbox.width,
                    h: item.bullet.bbox.height,
                    fontFace,
                    fontSize,
                    color: item.bullet.color,
                    align: "right",
                    valign: "top",
                    margin: 0,
                    breakLine: false,
                    lineSpacingMultiple: layout.textStyle.lineHeight,
                    paraSpaceBeforePt: 0,
                    paraSpaceAfterPt: 0,
                });
            }
        }
        const textRuns = buildTextRuns(item.lines).map((run) => ({
            text: run.text,
            options: {
                fontFace,
                fontSize,
                color,
                bold: run.bold,
            },
        }));
        slide.addText(textRuns, {
            x: item.textBox.x,
            y: item.textBox.y,
            w: item.textBox.width,
            h: item.textBox.height,
            fontFace,
            fontSize,
            color,
            align: "left",
            valign: "top",
            margin: 0,
            breakLine: true,
            lineSpacingMultiple: layout.textStyle.lineHeight,
            paraSpaceBeforePt: 0,
            paraSpaceAfterPt: 0,
        });
    });
}
export function renderListElement(slide, shapeType, element) {
    renderListLayout(slide, shapeType, element);
}
//# sourceMappingURL=list.js.map