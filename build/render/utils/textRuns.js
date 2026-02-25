export function normalizeText(value) {
    if (!value) {
        return "";
    }
    return value.replace(/\\n/g, "\n");
}
export function parseBoldRuns(text) {
    const runs = [];
    if (!text) {
        return runs;
    }
    let cursor = 0;
    while (cursor < text.length) {
        const start = text.indexOf("**", cursor);
        if (start === -1) {
            const tail = text.slice(cursor);
            if (tail.length > 0) {
                runs.push({ text: tail, bold: false });
            }
            break;
        }
        if (start > cursor) {
            runs.push({ text: text.slice(cursor, start), bold: false });
        }
        const end = text.indexOf("**", start + 2);
        if (end === -1) {
            runs.push({ text: text.slice(start), bold: false });
            break;
        }
        const boldText = text.slice(start + 2, end);
        if (boldText.length > 0) {
            runs.push({ text: boldText, bold: true });
        }
        cursor = end + 2;
    }
    return runs;
}
//# sourceMappingURL=textRuns.js.map