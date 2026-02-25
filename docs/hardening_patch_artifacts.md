# Hardening Patch Artifacts

## 1) Repo State Fingerprint
- Current branch name: iter/theme-v2-geometry-v1
- Latest commit hash: dd318eb1d80ddd197d20ed455070e42ebbecc722
- Working tree clean?: no
- Node version: v22.18.0
- npm version: 10.9.3

Command:
```bash
git rev-parse --abbrev-ref HEAD
```
Output:
```text
iter/theme-v2-geometry-v1
```
Command:
```bash
git rev-parse HEAD
```
Output:
```text
dd318eb1d80ddd197d20ed455070e42ebbecc722
```
Command:
```bash
git status --porcelain
```
Output:
```text
 M AGENTS.md
 M DESIGN_LOG.md
 M build/render/card.d.ts.map
 M build/render/card.js
 M build/render/card.js.map
 M build/render/connector.d.ts
 M build/render/connector.d.ts.map
 M build/render/connector.js
 M build/render/connector.js.map
 M build/render/edge.d.ts.map
 M build/render/edge.js
 M build/render/edge.js.map
 M build/render/geometry.d.ts.map
 M build/render/geometry.js
 M build/render/geometry.js.map
 M build/render/index.d.ts.map
 M build/render/index.js
 M build/render/index.js.map
 M build/render/list.d.ts.map
 M build/render/list.js
 M build/render/list.js.map
 M build/render/node.d.ts.map
 M build/render/node.js
 M build/render/node.js.map
 M build/render/slide.d.ts.map
 M build/render/slide.js
 M build/render/slide.js.map
 M build/render/table.d.ts.map
 M build/render/table.js
 M build/render/table.js.map
 M build/render/text.d.ts.map
 M build/render/text.js
 M build/render/text.js.map
 M build/render/types.d.ts
 M build/render/types.d.ts.map
 M build/render/utils/textRuns.d.ts
 M build/render/utils/textRuns.d.ts.map
 M build/render/utils/textRuns.js
 M build/render/utils/textRuns.js.map
 M build/render/validate.d.ts.map
 M build/render/validate.js
 M build/render/validate.js.map
 M build/templates/compiler.d.ts.map
 M build/templates/compiler.js
 M build/templates/compiler.js.map
 M build/templates/types.d.ts
 M build/templates/types.d.ts.map
 M build/theme/tokenResolver.d.ts.map
 M build/theme/tokenResolver.js
 M build/theme/tokenResolver.js.map
 M build/theme/types.d.ts
 M build/theme/types.d.ts.map
 M build/tools/export-pdf.d.ts.map
 M build/tools/export-pdf.js
 M build/tools/export-pdf.js.map
 M docs/ITERATIONS.md
 M docs/geometry_v1.md
 M docs/templates_v1.md
 M examples/callouts_v0_good.json
 M examples/demos/pptmcp_capabilities_deck_v1.json
 M examples/demos/pptmcp_capabilities_deck_v1_dark.json
 M examples/geometry_v1_smoke.json
 M examples/smokes/geometry_arrowheads_diagonal.json
 M package.json
 M scripts/stability_v0_audit.py
 M scripts/stability_v0_log_assertions.py
 M scripts/stability_v0_repair_check.py
 M scripts/stability_v0_shape_counts.py
 M scripts/stability_v0_structural_check.py
 M src/render/card.ts
 M src/render/connector.ts
 M src/render/edge.ts
 M src/render/geometry.ts
 M src/render/index.ts
 M src/render/list.ts
 M src/render/node.ts
 M src/render/slide.ts
 M src/render/table.ts
 M src/render/text.ts
 M src/render/types.ts
 M src/render/utils/textRuns.ts
 M src/render/validate.ts
 M src/templates/compiler.ts
 M src/templates/config/card_grid_2x2.json
 M src/templates/config/chart_plus_insights.json
 M src/templates/config/matrix_3x3.json
 M src/templates/config/two_column_50_50.json
 M src/templates/types.ts
 M src/theme/config/consulting_dark_v1.json
 M src/theme/config/consulting_light_v1.json
 M src/theme/tokenResolver.ts
 M src/theme/types.ts
 M src/tools/export-pdf.ts
?? build/render/chevron.d.ts
?? build/render/chevron.d.ts.map
?? build/render/chevron.js
?? build/render/chevron.js.map
?? build/render/flow.d.ts
?? build/render/flow.d.ts.map
?? build/render/flow.js
?? build/render/flow.js.map
?? data/
?? docs/assets/
?? docs/hardening_patch_artifacts.md
?? docs/reference/
?? examples/demos/card_flow_diagram.json
?? examples/demos/eps_forecast_comparison.json
?? examples/demos/feature_expansion_v1.json
?? examples/demos/feature_expansion_v1_midnight.json
?? examples/demos/feature_expansion_v1_strategy.json
?? examples/demos/youtube_strategy_deck_v1.json
?? examples/smoke/
?? examples/smokes/card_flow_diagram.json
?? scripts/smoke-chevron-width-stress.mjs
?? scripts/smoke-templates-v1.mjs
?? scripts/stability_v0_qa.mjs
?? scripts/stability_v0_text_scan.py
?? scripts/youtube_strategy_audit.mjs
?? src/render/chevron.ts
?? src/render/flow.ts
?? src/templates/config/analysis_5_col.json
?? src/templates/config/architecture_flow.json
?? src/templates/config/before_after.json
?? src/templates/config/comparison_3_col.json
?? src/templates/config/kpi_dashboard.json
?? src/templates/config/matrix_2x2.json
?? src/templates/config/strategy_stack.json
?? src/templates/config/timeline_horizontal.json
?? src/theme/config/consulting_midnight_v1.json
?? src/theme/config/strategy_signal_v1.json
```
Command:
```bash
node -v
```
Output:
```text
v22.18.0
```
Command:
```bash
npm -v
```
Output:
```text
10.9.3
```
Command:
```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber | Format-List
```
Output:
```text


Caption     : Microsoft Windows 11 Pro
Version     : 10.0.26200
BuildNumber : 26200
```
## 2) Full Diff (Iteration Scope)
- Full repository git diff is large; complete prioritized scope is embedded below.
Command:
```bash
git diff --stat
```
Output:
```text
git.exe : warning: in the working copy of 'AGENTS.md', CRLF will be replaced by LF the next time Git touches it
At line:18 char:24
+ $diffStatOut = AsText (& git diff --stat 2>&1)
+                        ~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (warning: in the... Git touches it:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
warning: in the working copy of 'DESIGN_LOG.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'build/render/index.js', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'docs/ITERATIONS.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'docs/geometry_v1.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'docs/templates_v1.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'examples/callouts_v0_good.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'examples/demos/pptmcp_capabilities_deck_v1.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'examples/demos/pptmcp_capabilities_deck_v1_dark.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'examples/geometry_v1_smoke.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'examples/smokes/geometry_arrowheads_diagonal.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'package.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'scripts/stability_v0_audit.py', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'scripts/stability_v0_log_assertions.py', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'scripts/stability_v0_repair_check.py', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'scripts/stability_v0_shape_counts.py', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'scripts/stability_v0_structural_check.py', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/geometry.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/index.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/slide.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/table.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/text.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/types.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/validate.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/templates/compiler.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/theme/config/consulting_dark_v1.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/theme/config/consulting_light_v1.json', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/theme/tokenResolver.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/theme/types.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/tools/export-pdf.ts', CRLF will be replaced by LF the next time Git touches it
 AGENTS.md                                          |  40 +-
 DESIGN_LOG.md                                      |  35 ++
 build/render/card.d.ts.map                         |   2 +-
 build/render/card.js                               |  69 ++--
 build/render/card.js.map                           |   2 +-
 build/render/connector.d.ts                        |   7 +
 build/render/connector.d.ts.map                    |   2 +-
 build/render/connector.js                          | 110 +++++-
 build/render/connector.js.map                      |   2 +-
 build/render/edge.d.ts.map                         |   2 +-
 build/render/edge.js                               |   7 +-
 build/render/edge.js.map                           |   2 +-
 build/render/geometry.d.ts.map                     |   2 +-
 build/render/geometry.js                           | 186 ++++++++--
 build/render/geometry.js.map                       |   2 +-
 build/render/index.d.ts.map                        |   2 +-
 build/render/index.js                              |   4 +
 build/render/index.js.map                          |   2 +-
 build/render/list.d.ts.map                         |   2 +-
 build/render/list.js                               | 103 ++++--
 build/render/list.js.map                           |   2 +-
 build/render/node.d.ts.map                         |   2 +-
 build/render/node.js                               |  74 ++--
 build/render/node.js.map                           |   2 +-
 build/render/slide.d.ts.map                        |   2 +-
 build/render/slide.js                              |  80 +++-
 build/render/slide.js.map                          |   2 +-
 build/render/table.d.ts.map                        |   2 +-
 build/render/table.js                              |   5 +-
 build/render/table.js.map                          |   2 +-
 build/render/text.d.ts.map                         |   2 +-
 build/render/text.js                               |  19 +-
 build/render/text.js.map                           |   2 +-
 build/render/types.d.ts                            |  85 ++++-
 build/render/types.d.ts.map                        |   2 +-
 build/render/utils/textRuns.d.ts                   |   1 +
 build/render/utils/textRuns.d.ts.map               |   2 +-
 build/render/utils/textRuns.js                     |   6 +
 build/render/utils/textRuns.js.map                 |   2 +-
 build/render/validate.d.ts.map                     |   2 +-
 build/render/validate.js                           |  78 +++-
 build/render/validate.js.map                       |   2 +-
 build/templates/compiler.d.ts.map                  |   2 +-
 build/templates/compiler.js                        | 104 +++++-
 build/templates/compiler.js.map                    |   2 +-
 build/templates/types.d.ts                         |   2 +-
 build/templates/types.d.ts.map                     |   2 +-
 build/theme/tokenResolver.d.ts.map                 |   2 +-
 build/theme/tokenResolver.js                       | 163 ++++++++-
 build/theme/tokenResolver.js.map                   |   2 +-
 build/theme/types.d.ts                             |  71 ++++
 build/theme/types.d.ts.map                         |   2 +-
 build/tools/export-pdf.d.ts.map                    |   2 +-
 build/tools/export-pdf.js                          |   1 -
 build/tools/export-pdf.js.map                      |   2 +-
 docs/ITERATIONS.md                                 |  25 +-
 docs/geometry_v1.md                                |   5 +-
 docs/templates_v1.md                               |   3 +-
 examples/callouts_v0_good.json                     | 402 ++++++++++++++-------
 examples/demos/pptmcp_capabilities_deck_v1.json    |  10 +-
 .../demos/pptmcp_capabilities_deck_v1_dark.json    |  10 +-
 examples/geometry_v1_smoke.json                    |  26 +-
 examples/smokes/geometry_arrowheads_diagonal.json  |  16 +-
 package.json                                       |   5 +-
 scripts/stability_v0_audit.py                      |  24 ++
 scripts/stability_v0_log_assertions.py             |  22 +-
 scripts/stability_v0_repair_check.py               |  29 +-
 scripts/stability_v0_shape_counts.py               |  25 +-
 scripts/stability_v0_structural_check.py           |  51 ++-
 src/render/card.ts                                 |  89 +++--
 src/render/connector.ts                            | 127 ++++++-
 src/render/edge.ts                                 |   7 +-
 src/render/geometry.ts                             | 194 ++++++++--
 src/render/index.ts                                |   3 +
 src/render/list.ts                                 | 107 ++++--
 src/render/node.ts                                 |  77 ++--
 src/render/slide.ts                                |  94 ++++-
 src/render/table.ts                                |   5 +-
 src/render/text.ts                                 |  20 +-
 src/render/types.ts                                |  78 ++++
 src/render/utils/textRuns.ts                       |   7 +
 src/render/validate.ts                             |  87 ++++-
 src/templates/compiler.ts                          | 120 +++++-
 src/templates/config/card_grid_2x2.json            |  17 +-
 src/templates/config/chart_plus_insights.json      |   5 +-
 src/templates/config/matrix_3x3.json               |  18 +-
 src/templates/config/two_column_50_50.json         |  28 +-
 src/templates/types.ts                             |   1 +
 src/theme/config/consulting_dark_v1.json           |  37 +-
 src/theme/config/consulting_light_v1.json          |  37 +-
 src/theme/tokenResolver.ts                         | 154 +++++++-
 src/theme/types.ts                                 |  63 +++-
 src/tools/export-pdf.ts                            |   1 -
 93 files changed, 2801 insertions(+), 544 deletions(-)
```
Command:
```bash
git diff -- src/render/validate.ts src/render/types.ts src/render/card.ts src/render/text.ts src/render/list.ts src/render/connector.ts src/render/geometry.ts src/templates/compiler.ts src/templates/types.ts
```
Output:
```text
git.exe : warning: in the working copy of 'src/render/geometry.ts', CRLF will be replaced by LF the next time Git touches it
At line:20 char:27
+ ... t = AsText (& git diff -- src/render/validate.ts src/render/types.ts  ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (warning: in the... Git touches it:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
warning: in the working copy of 'src/render/text.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/types.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/render/validate.ts', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'src/templates/compiler.ts', CRLF will be replaced by LF the next time Git touches it
diff --git a/src/render/card.ts b/src/render/card.ts
index a626fd0..71d91f7 100644
--- a/src/render/card.ts
+++ b/src/render/card.ts
@@ -13,10 +13,18 @@ import { ptToIn } from "./utils/units.js";
 import { estimateTextLayout } from "./text.js";
 import { resolveIconData } from "./utils/icons.js";
 import { layoutList, renderListLayout } from "./list.js";
+import { normalizeText } from "./utils/textRuns.js";
 
 type CardSurfaceToken = "background" | "surface" | "elevated" | "accent";
 
-function resolveCardPadding(value: "sm" | "md" | "lg" | undefined, theme: ConcreteTheme): number {
+function resolveCardPaddingPt(
+  value: "sm" | "md" | "lg" | undefined,
+  valuePt: number | undefined,
+  theme: ConcreteTheme
+): number {
+  if (typeof valuePt === "number" && Number.isFinite(valuePt) && valuePt >= 0) {
+    return valuePt;
+  }
   const sm = theme.spaceScale[2] ?? theme.spaceScale[1] ?? 0;
   const md = theme.spaceScale[3] ?? sm;
   const lg = theme.spaceScale[4] ?? md;
@@ -85,7 +93,15 @@ function resolveShadow(
   };
 }
 
-type ResolvedCardStyle = Required<Omit<CardStyleSpec, "accent">> & { accent: CardStyleAccent };
+type ResolvedCardStyle = {
+  bg: NonNullable<CardStyleSpec["bg"]>;
+  border: NonNullable<CardStyleSpec["border"]>;
+  radius: NonNullable<CardStyleSpec["radius"]>;
+  padding: NonNullable<CardStyleSpec["padding"]>;
+  paddingPt?: number;
+  shadow: NonNullable<CardStyleSpec["shadow"]>;
+  accent: CardStyleAccent;
+};
 
 function resolveVariantDefaults(variant: CardElement["variant"] | undefined, theme: ConcreteTheme): ResolvedCardStyle {
   const baseAccent: CardStyleAccent = { edge: "none", color: "accent", width: theme.strokeScale.normal };
@@ -175,7 +191,7 @@ export function prepareCardElement(args: {
   const variantDefaults = resolveVariantDefaults(args.element.variant, args.theme);
   const styleSpec = mergeCardStyle(variantDefaults, args.element.style);
 
-  const paddingPt = resolveCardPadding(styleSpec.padding, args.theme);
+  const paddingPt = resolveCardPaddingPt(styleSpec.padding, styleSpec.paddingPt, args.theme);
   const radius = resolveCardRadius(styleSpec.radius, args.theme);
   const surface = resolveSurfaceToken(styleSpec.bg, "surface", args.theme);
   const fill = surface.fill;
@@ -186,13 +202,15 @@ export function prepareCardElement(args: {
   const innerY = args.bbox.y + ptToIn(paddingPt);
   const innerW = args.bbox.width - ptToIn(paddingPt * 2);
   const innerH = args.bbox.height - ptToIn(paddingPt * 2);
+  const innerHeightPt = innerH * 72;
 
   if (innerW <= 0 || innerH <= 0) {
     args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(Math.abs(innerH * 72))})`);
   }
 
-  const headerGapPt = args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0;
-  const footerGapPt = args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0;
+  const sectionGapPt = Math.max(args.theme.spaceScale[1] ?? 0, paddingPt / 2);
+  const headerGapPt = sectionGapPt;
+  const footerGapPt = sectionGapPt;
 
   const minInsetPt = args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0;
   const minInsetIn = ptToIn(minInsetPt);
@@ -200,6 +218,8 @@ export function prepareCardElement(args: {
   let header: PreparedCardElement["header"];
   let headerHeightPt = 0;
   if (args.element.header) {
+    const headerTitle = normalizeText(args.element.header.title ?? "");
+    const headerSubtitle = normalizeText(args.element.header.subtitle ?? "");
     const titleFont = args.theme.fontScale.subtitle;
     const subtitleFont = args.theme.fontScale.caption;
     const titleBold = titleFont.weight >= args.theme.type.weightBold;
@@ -219,22 +239,22 @@ export function prepareCardElement(args: {
     const titleLineHeight = lineHeightMultiple(titleFont.size, args.theme);
     const subtitleLineHeight = lineHeightMultiple(subtitleFont.size, args.theme);
     const titleHeightPt = estimateTextHeight({
-      text: args.element.header.title,
+      text: headerTitle,
       fontSize: titleFont.size,
       bold: titleBold,
       widthIn: Math.max(minInsetIn, textWidthIn),
       lineHeight: titleLineHeight,
     });
-    const subtitleHeightPt = args.element.header.subtitle
+    const subtitleHeightPt = headerSubtitle
       ? estimateTextHeight({
-          text: args.element.header.subtitle,
+          text: headerSubtitle,
           fontSize: subtitleFont.size,
           bold: subtitleBold,
           widthIn: Math.max(minInsetIn, textWidthIn),
           lineHeight: subtitleLineHeight,
         })
       : 0;
-    const subtitleGapPt = args.element.header.subtitle ? (args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0) : 0;
+    const subtitleGapPt = headerSubtitle ? (args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0) : 0;
     const textBlockHeightPt = titleHeightPt + subtitleGapPt + subtitleHeightPt;
     headerHeightPt = Math.max(iconSizePt, textBlockHeightPt);
 
@@ -266,7 +286,7 @@ export function prepareCardElement(args: {
       width: Math.max(minInsetIn, textWidthIn),
       height: Math.max(minInsetIn, titleHeightPt / 72),
     };
-    const subtitleBox: BBox | undefined = args.element.header.subtitle
+    const subtitleBox: BBox | undefined = headerSubtitle
       ? {
           x: textX,
           y: innerY + ptToIn(titleHeightPt + subtitleGapPt),
@@ -276,8 +296,8 @@ export function prepareCardElement(args: {
       : undefined;
 
     header = {
-      title: args.element.header.title,
-      subtitle: args.element.header.subtitle,
+      title: headerTitle,
+      subtitle: headerSubtitle || undefined,
       titleBox,
       subtitleBox,
       titleFont: {
@@ -286,7 +306,7 @@ export function prepareCardElement(args: {
         bold: titleBold,
         color: args.theme.text.colorPrimary,
       },
-      subtitleFont: args.element.header.subtitle
+      subtitleFont: headerSubtitle
         ? {
             face: subtitleFont.family,
             size: subtitleFont.size,
@@ -302,25 +322,27 @@ export function prepareCardElement(args: {
   let footer: PreparedCardElement["footer"];
   let footerHeightPt = 0;
   if (args.element.footer && (args.element.footer.label || args.element.footer.text)) {
-    const footerPaddingPt = args.theme.spaceScale[0] ?? 0;
+    const footerLabel = normalizeText(args.element.footer.label ?? "");
+    const footerText = normalizeText(args.element.footer.text ?? "");
+    const footerPaddingPt = paddingPt;
     const labelFont = args.theme.fontScale.body;
     const textFont = args.theme.fontScale.body;
     const labelBold = labelFont.weight >= args.theme.type.weightBold;
     const textBold = textFont.weight >= args.theme.type.weightBold;
     const footerContentWidthIn = innerW - ptToIn(footerPaddingPt * 2);
     const footerLineHeight = lineHeightMultiple(textFont.size, args.theme);
-    const labelHeightPt = args.element.footer.label
+    const labelHeightPt = footerLabel
       ? estimateTextHeight({
-          text: args.element.footer.label,
+          text: footerLabel,
           fontSize: labelFont.size,
           bold: labelBold,
           widthIn: Math.max(minInsetIn, footerContentWidthIn),
           lineHeight: footerLineHeight,
         })
       : 0;
-    const textHeightPt = args.element.footer.text
+    const textHeightPt = footerText
       ? estimateTextHeight({
-          text: args.element.footer.text,
+          text: footerText,
           fontSize: textFont.size,
           bold: textBold,
           widthIn: Math.max(minInsetIn, footerContentWidthIn),
@@ -328,12 +350,14 @@ export function prepareCardElement(args: {
         })
       : 0;
     const footerTextGapPt =
-      args.element.footer.label && args.element.footer.text
+      footerLabel && footerText
         ? (args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0)
         : 0;
     const footerContentHeightPt = labelHeightPt + footerTextGapPt + textHeightPt;
-    const footerStripHeightPt =
-      args.theme.fontScale.body.size + (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0);
+    const footerStripHeightPt = Math.max(
+      args.theme.fontScale.body.size + footerPaddingPt * 2,
+      footerContentHeightPt + footerPaddingPt * 2
+    );
     const footerAvailablePt = footerStripHeightPt - footerPaddingPt * 2;
     if (footerContentHeightPt > footerAvailablePt && args.hardErrors) {
       args.hardErrors.push(
@@ -343,7 +367,7 @@ export function prepareCardElement(args: {
     footerHeightPt = footerStripHeightPt;
 
     const footerY = args.bbox.y + args.bbox.height - ptToIn(paddingPt) - ptToIn(footerHeightPt);
-    const labelBox: BBox | undefined = args.element.footer.label
+    const labelBox: BBox | undefined = footerLabel
       ? {
           x: innerX + ptToIn(footerPaddingPt),
           y: footerY + ptToIn(footerPaddingPt),
@@ -351,7 +375,7 @@ export function prepareCardElement(args: {
           height: Math.max(minInsetIn, labelHeightPt / 72),
         }
       : undefined;
-    const textBox: BBox | undefined = args.element.footer.text
+    const textBox: BBox | undefined = footerText
       ? {
           x: innerX + ptToIn(footerPaddingPt),
           y: footerY + ptToIn(footerPaddingPt + labelHeightPt + footerTextGapPt),
@@ -368,8 +392,8 @@ export function prepareCardElement(args: {
         width: args.bbox.width,
         height: ptToIn(footerHeightPt),
       },
-      label: args.element.footer.label,
-      text: args.element.footer.text,
+      label: footerLabel || undefined,
+      text: footerText || undefined,
       labelFont: labelBox
         ? {
             face: labelFont.family,
@@ -435,6 +459,11 @@ export function prepareCardElement(args: {
     args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(bodyUsedPt - availableHeightPt)})`);
   }
 
+  const contentHeightPt =
+    (headerHeightPt > 0 ? headerHeightPt + headerGapPt : 0) +
+    bodyUsedPt +
+    (footerHeightPt > 0 ? footerHeightPt + footerGapPt : 0);
+
   let accent: PreparedCardElement["accent"];
   if (styleSpec.accent && styleSpec.accent.edge && styleSpec.accent.edge !== "none") {
     const accentWidthPt =
@@ -472,6 +501,7 @@ export function prepareCardElement(args: {
     id: args.id,
     region: args.element.region,
     bbox: args.bbox,
+    layoutProfile: args.element.layoutProfile,
     style: {
       fill,
       border: border.color,
@@ -483,6 +513,11 @@ export function prepareCardElement(args: {
     header,
     body: bodyLayouts,
     footer,
+    metrics: {
+      innerHeightPt,
+      contentHeightPt,
+      bodyUsedPt,
+    },
   };
 }
 
@@ -532,6 +567,7 @@ export function renderCardElement(slide: any, shapeType: any, element: PreparedC
       align: "left",
       valign: "top",
       margin: 0,
+      breakLine: true,
     });
     if (element.header.subtitle && element.header.subtitleBox && element.header.subtitleFont) {
       slide.addText(element.header.subtitle, {
@@ -546,6 +582,7 @@ export function renderCardElement(slide: any, shapeType: any, element: PreparedC
         align: "left",
         valign: "top",
         margin: 0,
+        breakLine: true,
       });
     }
   }
@@ -578,6 +615,7 @@ export function renderCardElement(slide: any, shapeType: any, element: PreparedC
         align: "left",
         valign: "top",
         margin: 0,
+        breakLine: true,
       });
     }
     if (element.footer.text && element.footer.textBox && element.footer.textFont) {
@@ -593,6 +631,7 @@ export function renderCardElement(slide: any, shapeType: any, element: PreparedC
         align: "left",
         valign: "top",
         margin: 0,
+        breakLine: true,
       });
     }
   }
diff --git a/src/render/connector.ts b/src/render/connector.ts
index 9c316d4..581be09 100644
--- a/src/render/connector.ts
+++ b/src/render/connector.ts
@@ -1,4 +1,4 @@
-import type { ArrowHead, BBox, ConnectorElement, PreparedConnectorElement, Slide } from "./types.js";
+import type { AnchorPoint, ArrowHead, BBox, ConnectorElement, PreparedConnectorElement, Slide } from "./types.js";
 import type { ConcreteTheme } from "../theme/types.js";
 import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
 import { normalizeColor } from "./utils/color.js";
@@ -10,6 +10,7 @@ const ARROW_MIN_LEN_PT = 6;
 const ARROW_MAX_LEN_PT = 14;
 const ARROW_MIN_WIDTH_PT = 4;
 const ARROW_MAX_WIDTH_PT = 12;
+const ARROW_SCALE_MIN = 0.8;
 
 function clamp(value: number, min: number, max: number): number {
   return Math.max(min, Math.min(max, value));
@@ -58,6 +59,36 @@ function buildCenteredArrowHead(args: {
   };
 }
 
+function anchorPointFromBox(bbox: BBox, point: AnchorPoint): { x: number; y: number } {
+  const x0 = bbox.x;
+  const y0 = bbox.y;
+  const x1 = bbox.x + bbox.width;
+  const y1 = bbox.y + bbox.height;
+  const cx = bbox.x + bbox.width / 2;
+  const cy = bbox.y + bbox.height / 2;
+
+  switch (point) {
+    case "n":
+      return { x: cx, y: y0 };
+    case "ne":
+      return { x: x1, y: y0 };
+    case "e":
+      return { x: x1, y: cy };
+    case "se":
+      return { x: x1, y: y1 };
+    case "s":
+      return { x: cx, y: y1 };
+    case "sw":
+      return { x: x0, y: y1 };
+    case "w":
+      return { x: x0, y: cy };
+    case "nw":
+      return { x: x0, y: y0 };
+    default:
+      return { x: cx, y: cy };
+  }
+}
+
 export function lineRectFromPoints(start: { x: number; y: number }, end: { x: number; y: number }): {
   rect: BBox;
   dx: number;
@@ -113,23 +144,32 @@ export function computeLineWithArrowheads(args: {
   color: string;
   startArrow: "none" | "triangle";
   endArrow: "none" | "triangle";
+  arrowSizePt?: number;
   warnings?: string[];
   warnPrefix?: string;
 }): {
   lineStart: { x: number; y: number };
   lineEnd: { x: number; y: number };
   arrowHeads: ArrowHead[];
+  error: string | null;
 } {
   const dx = args.end.x - args.start.x;
   const dy = args.end.y - args.start.y;
   const lineLength = Math.hypot(dx, dy);
   if (!Number.isFinite(lineLength) || lineLength === 0) {
-    return { lineStart: args.start, lineEnd: args.end, arrowHeads: [] };
+    return { lineStart: args.start, lineEnd: args.end, arrowHeads: [], error: "line_zero_length" };
   }
 
   const unit = { x: dx / lineLength, y: dy / lineLength };
-  const headLenPt = clamp(Math.round(4 * args.widthPt), ARROW_MIN_LEN_PT, ARROW_MAX_LEN_PT);
-  const headWidthPt = clamp(Math.round(2.5 * args.widthPt), ARROW_MIN_WIDTH_PT, ARROW_MAX_WIDTH_PT);
+  let headLenPt = clamp(Math.round(4 * args.widthPt), ARROW_MIN_LEN_PT, ARROW_MAX_LEN_PT);
+  let headWidthPt = clamp(Math.round(2.5 * args.widthPt), ARROW_MIN_WIDTH_PT, ARROW_MAX_WIDTH_PT);
+
+  if (Number.isFinite(args.arrowSizePt) && (args.arrowSizePt as number) > 0) {
+    const desiredLen = Math.max(0, args.arrowSizePt as number);
+    const widthRatio = headWidthPt / headLenPt;
+    headLenPt = desiredLen;
+    headWidthPt = desiredLen * widthRatio;
+  }
   let headLen = ptToIn(headLenPt);
   let headWidth = ptToIn(headWidthPt);
 
@@ -146,11 +186,16 @@ export function computeLineWithArrowheads(args: {
     const maxLen = Math.max(lineLength - EPSILON_INCHES, 0);
     if (headLen > maxLen) {
       const scale = maxLen > 0 ? maxLen / headLen : 0;
+      if (scale < ARROW_SCALE_MIN) {
+        return {
+          lineStart: args.start,
+          lineEnd: args.end,
+          arrowHeads: [],
+          error: "line_too_short",
+        };
+      }
       headLen *= scale;
       headWidth *= scale;
-      if (args.warnings && args.warnPrefix) {
-        args.warnings.push(`${args.warnPrefix} arrowhead_scaled`);
-      }
     }
     arrowHeads.push(
       buildCenteredArrowHead({
@@ -162,6 +207,20 @@ export function computeLineWithArrowheads(args: {
       })
     );
   } else if (startArrow) {
+    const maxLen = Math.max(lineLength - EPSILON_INCHES, 0);
+    if (headLen > maxLen) {
+      const scale = maxLen > 0 ? maxLen / headLen : 0;
+      if (scale < ARROW_SCALE_MIN) {
+        return {
+          lineStart: args.start,
+          lineEnd: args.end,
+          arrowHeads: [],
+          error: "line_too_short",
+        };
+      }
+      headLen *= scale;
+      headWidth *= scale;
+    }
     arrowHeads.push(
       buildCenteredArrowHead({
         tip: args.start,
@@ -176,7 +235,7 @@ export function computeLineWithArrowheads(args: {
   const lineStart = args.start;
   const lineEnd = endArrow ? { x: args.end.x - unit.x * headLen, y: args.end.y - unit.y * headLen } : args.end;
 
-  return { lineStart, lineEnd, arrowHeads };
+  return { lineStart, lineEnd, arrowHeads, error: null };
 }
 
 export function renderArrowHeads(slide: any, shapeType: any, arrowHeads: ArrowHead[]): void {
@@ -203,22 +262,55 @@ export function prepareConnectorElement(args: {
   id: string;
   bbox: BBox;
   theme: ConcreteTheme;
+  flow?: {
+    stepBoxes: Map<string, BBox>;
+    strokePt?: number;
+    arrowSizePt?: number;
+  };
   hardErrors: string[];
 }): PreparedConnectorElement {
   const defaults = resolveElementStyleDefaults(args.element, args.theme);
-  const start = resolveRegionAnchor({
+  let start = resolveRegionAnchor({
     anchor: args.element.start,
     regions: args.slide.regions,
     grid: args.slide.grid,
   });
-  const end = resolveRegionAnchor({
+  let end = resolveRegionAnchor({
     anchor: args.element.end,
     regions: args.slide.regions,
     grid: args.slide.grid,
   });
 
+  const startBox =
+    args.flow?.stepBoxes && args.element.start.type === "region"
+      ? args.flow.stepBoxes.get(args.element.start.targetRegion)
+      : undefined;
+  const endBox =
+    args.flow?.stepBoxes && args.element.end.type === "region"
+      ? args.flow.stepBoxes.get(args.element.end.targetRegion)
+      : undefined;
+
+  if (startBox) {
+    const anchored = anchorPointFromBox(startBox, args.element.start.point);
+    start = { x: anchored.x, y: startBox.y + startBox.height / 2 };
+  }
+  if (endBox) {
+    const anchored = anchorPointFromBox(endBox, args.element.end.point);
+    end = { x: anchored.x, y: endBox.y + endBox.height / 2 };
+  }
+
   const widthPt = args.element.style?.widthPt ?? defaults.strokeStyle?.widthPt ?? args.theme.strokeScale.normal ?? DEFAULT_CONNECTOR_WIDTH_PT;
-  if (!Number.isFinite(widthPt) || widthPt <= 0) {
+  const flowActive = Boolean(startBox && endBox);
+  const flowWidthPt = flowActive ? args.flow?.strokePt : undefined;
+  let flowArrowSizePt = flowActive ? args.flow?.arrowSizePt : undefined;
+  if (flowActive && flowArrowSizePt && Number.isFinite(flowArrowSizePt)) {
+    const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
+    const maxArrowPt = Math.max(0, (lengthIn - EPSILON_INCHES) * 72);
+    flowArrowSizePt = Math.min(flowArrowSizePt, maxArrowPt);
+  }
+  const resolvedWidthPt =
+    flowWidthPt && Number.isFinite(flowWidthPt) ? Math.max(widthPt, flowWidthPt) : widthPt;
+  if (!Number.isFinite(resolvedWidthPt) || resolvedWidthPt <= 0) {
     args.hardErrors.push(
       `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: line_width_invalid`
     );
@@ -248,12 +340,14 @@ export function prepareConnectorElement(args: {
     lineStart: start,
     lineEnd: end,
     style: {
-      widthPt,
+      widthPt: resolvedWidthPt,
       color,
       startArrow,
       endArrow,
     },
     arrowHeads: [],
+    customArrowheads: flowActive && Boolean(flowArrowSizePt),
+    arrowSizePt: flowActive ? flowArrowSizePt : undefined,
     lineRect: baseRect.rect,
     lineFlipV: baseRect.flipV,
     lineFlipH: baseRect.flipH,
@@ -261,6 +355,9 @@ export function prepareConnectorElement(args: {
 }
 
 export function renderConnectorElement(slide: any, shapeType: any, element: PreparedConnectorElement): void {
+  const useCustom = element.customArrowheads && element.arrowHeads && element.arrowHeads.length > 0;
+  const beginArrowType = useCustom ? "none" : element.style.startArrow === "triangle" ? "triangle" : "none";
+  const endArrowType = useCustom ? "none" : element.style.endArrow === "triangle" ? "triangle" : "none";
   slide.addShape(shapeType.line, {
     x: element.lineRect.x,
     y: element.lineRect.y,
@@ -271,9 +368,11 @@ export function renderConnectorElement(slide: any, shapeType: any, element: Prep
     line: {
       color: element.style.color,
       width: element.style.widthPt,
+      beginArrowType,
+      endArrowType,
     },
   });
-  if (element.arrowHeads && element.arrowHeads.length > 0) {
-    renderArrowHeads(slide, shapeType, element.arrowHeads);
+  if (useCustom) {
+    renderArrowHeads(slide, shapeType, element.arrowHeads || []);
   }
 }
diff --git a/src/render/geometry.ts b/src/render/geometry.ts
index eae7ac7..f6f4723 100644
--- a/src/render/geometry.ts
+++ b/src/render/geometry.ts
@@ -22,6 +22,48 @@ function roundBox(box: BBox): BBox {
   };
 }
 
+function unionBoxes(current: BBox | null, next: BBox): BBox {
+  if (!current) {
+    return { ...next };
+  }
+  const x0 = Math.min(current.x, next.x);
+  const y0 = Math.min(current.y, next.y);
+  const x1 = Math.max(current.x + current.width, next.x + next.width);
+  const y1 = Math.max(current.y + current.height, next.y + next.height);
+  return {
+    x: x0,
+    y: y0,
+    width: x1 - x0,
+    height: y1 - y0,
+  };
+}
+
+function translatePoint(point: { x: number; y: number }, delta: { x: number; y: number }): { x: number; y: number } {
+  return roundPoint({ x: point.x + delta.x, y: point.y + delta.y });
+}
+
+function translateBox(box: BBox, delta: { x: number; y: number }): BBox {
+  return roundBox({
+    x: box.x + delta.x,
+    y: box.y + delta.y,
+    width: box.width,
+    height: box.height,
+  });
+}
+
+function translateArrowHead(arrow: any, delta: { x: number; y: number }): any {
+  return {
+    ...arrow,
+    bbox: translateBox(arrow.bbox, delta),
+    points: arrow.points.map((point: any) => {
+      if ("close" in point) {
+        return point;
+      }
+      return { ...point, x: roundGeom(point.x + delta.x), y: roundGeom(point.y + delta.y) };
+    }),
+  };
+}
+
 function roundArrowHead(arrow: any): any {
   return {
     ...arrow,
@@ -99,29 +141,37 @@ function resolveConnectorGeometry(
     hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${lineRectResult.error}`);
   }
 
-  const arrowMeta = computeLineWithArrowheads({
-    start,
-    end,
-    widthPt: element.style.widthPt,
-    color: element.style.color,
-    startArrow: element.style.startArrow,
-    endArrow: element.style.endArrow,
-    warnings,
-    warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
-  });
+  let lineStart = roundPoint(start);
+  let lineEnd = roundPoint(end);
+  let arrowHeads: any[] = [];
+
+  if (element.customArrowheads) {
+    const arrowMeta = computeLineWithArrowheads({
+      start,
+      end,
+      widthPt: element.style.widthPt,
+      color: element.style.color,
+      startArrow: element.style.startArrow,
+      endArrow: element.style.endArrow,
+      arrowSizePt: element.arrowSizePt,
+      warnings,
+      warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
+    });
+    if (arrowMeta.error) {
+      hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
+    }
+    lineStart = roundPoint(arrowMeta.lineStart);
+    lineEnd = roundPoint(arrowMeta.lineEnd);
+    arrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));
+  }
 
-  const lineStart = roundPoint(arrowMeta.lineStart);
-  const lineEnd = roundPoint(arrowMeta.lineEnd);
   const adjustedRect = lineRectFromPoints(lineStart, lineEnd);
 
   element.start = start;
   element.end = end;
   element.lineStart = lineStart;
   element.lineEnd = lineEnd;
-  if (arrowMeta.arrowHeads.length > 1) {
-    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: connector_arrowhead_count_invalid`);
-  }
-  element.arrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));
+  element.arrowHeads = arrowHeads;
   element.lineRect = roundBox(adjustedRect.rect);
   element.lineFlipV = adjustedRect.flipV;
   element.lineFlipH = adjustedRect.flipH;
@@ -140,29 +190,16 @@ function resolveEdgeGeometry(
     hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${lineRectResult.error}`);
   }
 
-  const arrowMeta = computeLineWithArrowheads({
-    start,
-    end,
-    widthPt: element.style.widthPt,
-    color: element.style.color,
-    startArrow: "none",
-    endArrow: element.style.endArrow,
-    warnings,
-    warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
-  });
-
-  const lineStart = roundPoint(arrowMeta.lineStart);
-  const lineEnd = roundPoint(arrowMeta.lineEnd);
+  const lineStart = roundPoint(start);
+  const lineEnd = roundPoint(end);
   const adjustedRect = lineRectFromPoints(lineStart, lineEnd);
 
   element.start = start;
   element.end = end;
   element.lineStart = lineStart;
   element.lineEnd = lineEnd;
-  if (arrowMeta.arrowHeads.length > 1) {
-    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: edge_arrowhead_count_invalid`);
-  }
-  element.arrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));
+  element.arrowHeads = [];
+  element.metrics = { renderMode: "unified" };
   element.lineRect = roundBox(adjustedRect.rect);
   element.lineFlipV = adjustedRect.flipV;
   element.lineFlipH = adjustedRect.flipH;
@@ -195,6 +232,9 @@ function resolveCalloutLeaderGeometry(
     warnings,
     warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
   });
+  if (arrowMeta.error) {
+    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
+  }
 
   const lineStart = roundPoint(arrowMeta.lineStart);
   const lineEnd = roundPoint(arrowMeta.lineEnd);
@@ -213,6 +253,93 @@ function resolveCalloutLeaderGeometry(
   element.leaderFlipH = adjustedRect.flipH;
 }
 
+function applyDiagramCentering(slide: PreparedSlide): void {
+  if (!slide.diagramRegionBBox) {
+    return;
+  }
+
+  let diagramBBox: BBox | null = null;
+
+  slide.elements.forEach((element) => {
+    if (element.kind === "node") {
+      element.bbox = roundBox(element.bbox);
+      if (element.icon) {
+        element.icon.bbox = roundBox(element.icon.bbox);
+      }
+      element.label.bbox = roundBox(element.label.bbox);
+      diagramBBox = unionBoxes(diagramBBox, element.bbox);
+    } else if (element.kind === "edge") {
+      element.lineRect = roundBox(element.lineRect);
+      diagramBBox = unionBoxes(diagramBBox, element.lineRect);
+    } else if (element.kind === "connector") {
+      element.lineRect = roundBox(element.lineRect);
+      diagramBBox = unionBoxes(diagramBBox, element.lineRect);
+    }
+  });
+
+  if (!diagramBBox) {
+    return;
+  }
+
+  const region = roundBox(slide.diagramRegionBBox);
+  const regionCenter = { x: region.x + region.width / 2, y: region.y + region.height / 2 };
+  const diagramBox = diagramBBox as BBox;
+  const diagramCenter = { x: diagramBox.x + diagramBox.width / 2, y: diagramBox.y + diagramBox.height / 2 };
+  const delta = { x: regionCenter.x - diagramCenter.x, y: regionCenter.y - diagramCenter.y };
+
+  if (Math.abs(delta.x) < EPSILON_INCHES && Math.abs(delta.y) < EPSILON_INCHES) {
+    return;
+  }
+
+  slide.elements.forEach((element) => {
+    if (element.kind === "node") {
+      element.bbox = translateBox(element.bbox, delta);
+      if (element.icon) {
+        element.icon.bbox = translateBox(element.icon.bbox, delta);
+      }
+      element.label.bbox = translateBox(element.label.bbox, delta);
+    } else if (element.kind === "edge") {
+      element.start = translatePoint(element.start, delta);
+      element.end = translatePoint(element.end, delta);
+      element.lineStart = translatePoint(element.lineStart ?? element.start, delta);
+      element.lineEnd = translatePoint(element.lineEnd ?? element.end, delta);
+      element.lineRect = translateBox(element.lineRect, delta);
+    } else if (element.kind === "connector") {
+      element.start = translatePoint(element.start, delta);
+      element.end = translatePoint(element.end, delta);
+      element.lineStart = translatePoint(element.lineStart ?? element.start, delta);
+      element.lineEnd = translatePoint(element.lineEnd ?? element.end, delta);
+      element.lineRect = translateBox(element.lineRect, delta);
+      if (element.arrowHeads && element.arrowHeads.length > 0) {
+        element.arrowHeads = element.arrowHeads.map((arrow) => translateArrowHead(arrow, delta));
+      }
+    } else if (element.kind === "callout") {
+      element.anchor = translatePoint(element.anchor, delta);
+      element.box = translateBox(element.box, delta);
+      element.text.bbox = translateBox(element.text.bbox, delta);
+      if (element.icon) {
+        element.icon.bbox = translateBox(element.icon.bbox, delta);
+      }
+      if (element.leader) {
+        element.leader.start = translatePoint(element.leader.start, delta);
+        element.leader.end = translatePoint(element.leader.end, delta);
+        if (element.leaderLineStart) {
+          element.leaderLineStart = translatePoint(element.leaderLineStart, delta);
+        }
+        if (element.leaderLineEnd) {
+          element.leaderLineEnd = translatePoint(element.leaderLineEnd, delta);
+        }
+        if (element.leaderRect) {
+          element.leaderRect = translateBox(element.leaderRect, delta);
+        }
+        if (element.leaderArrowHeads && element.leaderArrowHeads.length > 0) {
+          element.leaderArrowHeads = element.leaderArrowHeads.map((arrow) => translateArrowHead(arrow, delta));
+        }
+      }
+    }
+  });
+}
+
 export function resolveGeometryV1(args: {
   slides: PreparedSlide[];
   warnings: string[];
@@ -228,5 +355,6 @@ export function resolveGeometryV1(args: {
         resolveCalloutLeaderGeometry(element, slideIndex, args.warnings, args.hardErrors);
       }
     });
+    applyDiagramCentering(slide);
   });
 }
diff --git a/src/render/list.ts b/src/render/list.ts
index 1d90599..8d6642c 100644
--- a/src/render/list.ts
+++ b/src/render/list.ts
@@ -13,7 +13,7 @@ import type { ConcreteTheme } from "../theme/types.js";
 import { normalizeColor } from "./utils/color.js";
 import { ptToIn } from "./utils/units.js";
 import { textUnits } from "./text.js";
-import { parseBoldRuns } from "./utils/textRuns.js";
+import { normalizeText, parseBoldRuns } from "./utils/textRuns.js";
 import { resolveIconData } from "./utils/icons.js";
 
 const DEFAULT_LINE_HEIGHT = 1.2;
@@ -95,6 +95,25 @@ function tokensToRuns(tokens: Token[]): PreparedListTextRun[] {
   return runs;
 }
 
+function splitRunsOnNewline(runs: PreparedListTextRun[]): PreparedListTextRun[][] {
+  const paragraphs: PreparedListTextRun[][] = [];
+  let current: PreparedListTextRun[] = [];
+  runs.forEach((run) => {
+    const parts = run.text.split("\n");
+    parts.forEach((part, idx) => {
+      if (part.length > 0) {
+        current.push({ text: part, bold: run.bold });
+      }
+      if (idx < parts.length - 1) {
+        paragraphs.push(current);
+        current = [];
+      }
+    });
+  });
+  paragraphs.push(current);
+  return paragraphs;
+}
+
 function wrapRuns(runs: PreparedListTextRun[], maxUnitsPerLine: number): PreparedListLine[] {
   const tokens = tokenizeRuns(runs);
   const lines: PreparedListLine[] = [];
@@ -209,18 +228,24 @@ export function layoutList(args: {
 
   const bulletSizePt = resolveBulletSize(args.list.bullet?.size, args.theme);
   const bulletGapPt =
-    typeof args.list.bullet?.gap === "number" ? args.list.bullet.gap : DEFAULT_BULLET_GAP_PT;
+    typeof args.list.bullet?.gap === "number"
+      ? args.list.bullet.gap
+      : (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? DEFAULT_BULLET_GAP_PT);
   const bulletColor = normalizeColor(resolveBulletColor(args.list.bullet?.color, args.theme), args.theme.text.colorPrimary);
   const leftPt = typeof args.list.indent?.left === "number" ? args.list.indent.left : 0;
   const hangingPt =
     typeof args.list.indent?.hanging === "number" ? args.list.indent.hanging : bulletSizePt + bulletGapPt;
-  const lineGapPt = typeof args.list.lineGap === "number" ? args.list.lineGap : DEFAULT_LINE_GAP_PT;
+  const lineGapPt =
+    typeof args.list.lineGap === "number"
+      ? args.list.lineGap
+      : (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? DEFAULT_LINE_GAP_PT);
 
   if (hangingPt < bulletSizePt + bulletGapPt - 0.1 && args.hardErrors) {
     args.hardErrors.push(`${prefix}list_indent_invalid`);
   }
 
-  const textStartX = args.bbox.x + ptToIn(leftPt + hangingPt);
+  const textBoxX = args.bbox.x + ptToIn(leftPt);
+  const textStartX = textBoxX + ptToIn(hangingPt);
   const textWidthIn = args.bbox.width - ptToIn(leftPt + hangingPt);
   if (textWidthIn <= 0 && args.hardErrors) {
     args.hardErrors.push(`${prefix}list_indent_invalid`);
@@ -263,22 +288,32 @@ export function layoutList(args: {
   const items: PreparedListItem[] = [];
 
   (args.list.items ?? []).forEach((item, idx) => {
-    const runs = parseBoldRuns(item.text ?? "");
-    const lines = wrapRuns(runs, maxUnitsPerLine);
+    const normalized = normalizeText(item.text ?? "");
+    const runs = parseBoldRuns(normalized);
+    const paragraphs = splitRunsOnNewline(runs);
+    const lines: PreparedListLine[] = [];
+    paragraphs.forEach((paraRuns) => {
+      const wrapped = wrapRuns(paraRuns, maxUnitsPerLine);
+      if (wrapped.length === 0) {
+        lines.push({ runs: [{ text: "", bold: false }] });
+      } else {
+        lines.push(...wrapped);
+      }
+    });
     const itemHeightPt = Math.max(lineHeightPt, lines.length * lineHeightPt);
     const itemHeightIn = itemHeightPt / 72;
 
+    const isNumber = style === "number";
     const textBox: BBox = {
-      x: textStartX,
+      x: isNumber ? textBoxX : textStartX,
       y: cursorY,
-      width: Math.max(0, textWidthIn),
+      width: Math.max(0, isNumber ? args.bbox.width - ptToIn(leftPt) : textWidthIn),
       height: itemHeightIn,
     };
 
     let bullet: PreparedListBullet | undefined;
-    if (style !== "none") {
+    if (style !== "none" && style !== "number") {
       const bulletBoxX = args.bbox.x + ptToIn(leftPt);
-      const bulletBoxW = ptToIn(hangingPt);
       const bulletSizeIn = ptToIn(bulletSizePt);
       const bulletRight = textStartX - ptToIn(bulletGapPt);
       const bulletLeft = bulletRight - bulletSizeIn;
@@ -294,14 +329,7 @@ export function layoutList(args: {
         args.hardErrors.push(`${prefix}list_alignment_invalid`);
       }
 
-      if (style === "number") {
-        bullet = {
-          type: "number",
-          bbox: { x: bulletBoxX, y: cursorY, width: bulletBoxW, height: lineHeightPt / 72 },
-          color: bulletColor,
-          text: `${idx + 1}.`,
-        };
-      } else if (style === "dot") {
+      if (style === "dot") {
         bullet = {
           type: "dot",
           bbox: { x: bulletLeft, y: bulletY, width: bulletSizeIn, height: bulletSizeIn },
@@ -352,6 +380,13 @@ export function layoutList(args: {
       color: bulletColor,
     },
     totalHeightPt,
+    metrics: {
+      textStartX,
+      textBoxX,
+      hangingPt,
+      leftPt,
+      numberedInline: style === "number",
+    },
   };
 }
 
@@ -395,8 +430,9 @@ export function renderListLayout(
   const fontFace = overrides?.fontFace ?? layout.textStyle.fontFace;
   const fontSize = overrides?.fontSize ?? layout.textStyle.fontSize;
   const color = overrides?.color ?? layout.textStyle.color;
+  const hangingPt = layout.metrics?.hangingPt ?? layout.bulletStyle.sizePt + layout.bulletStyle.gapPt;
 
-  layout.items.forEach((item) => {
+  layout.items.forEach((item, idx) => {
     if (item.bullet) {
       if (item.bullet.type === "dot") {
         slide.addShape(shapeType.ellipse, {
@@ -408,20 +444,7 @@ export function renderListLayout(
           line: { color: item.bullet.color, width: 0 },
         });
       } else if (item.bullet.type === "number") {
-        slide.addText(item.bullet.text ?? "", {
-          x: item.bullet.bbox.x,
-          y: item.bullet.bbox.y,
-          w: item.bullet.bbox.width,
-          h: item.bullet.bbox.height,
-          fontFace,
-          fontSize,
-          color: item.bullet.color,
-          bold: false,
-          align: "right",
-          valign: "top",
-          margin: 0,
-          lineSpacingMultiple: layout.textStyle.lineHeight,
-        });
+        // number bullets are rendered inline with text using PPTX bullets
       } else if (item.bullet.type === "icon" && item.bullet.data) {
         slide.addImage({
           data: item.bullet.data,
@@ -443,6 +466,21 @@ export function renderListLayout(
       },
     }));
 
+    const bullet =
+      layout.bulletStyle.style === "number"
+        ? {
+            type: "number",
+            indent: hangingPt,
+            numberType: "arabicPeriod",
+            numberStartAt: idx + 1,
+          }
+        : undefined;
+
+    const margin =
+      layout.bulletStyle.style === "number"
+        ? 0
+        : [0, 0, 0, hangingPt];
+
     slide.addText(textRuns, {
       x: item.textBox.x,
       y: item.textBox.y,
@@ -453,9 +491,10 @@ export function renderListLayout(
       color,
       align: "left",
       valign: "top",
-      margin: 0,
+      margin,
       breakLine: true,
       lineSpacingMultiple: layout.textStyle.lineHeight,
+      bullet,
     });
   });
 }
diff --git a/src/render/text.ts b/src/render/text.ts
index 0773244..eeccfa1 100644
--- a/src/render/text.ts
+++ b/src/render/text.ts
@@ -12,8 +12,11 @@ import type { ConcreteTheme } from "../theme/types.js";
 import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
 import { normalizeColor } from "./utils/color.js";
 import { addValidationEntry, buildOverflowMessage } from "./validate.js";
+import { normalizeText } from "./utils/textRuns.js";
 
 const DEFAULT_MIN_FONT = 10;
+const MIN_BODY_FONT_PT = 14;
+const MIN_TITLE_FONT_PT = 24;
 const DEFAULT_TEXT_PADDING_PT = 2;
 
 function alignToPptx(value: TextStyle["align"] | undefined): "left" | "center" | "right" | "justify" {
@@ -73,13 +76,22 @@ function resolveTextStyle(
   valign: "top" | "middle" | "bottom";
 } {
   const scale = resolveFontScale(regionName, theme);
-  const baseSize = style?.fontSize ?? scale.size;
+  const baseSize = scale.size;
   const defaultPadding = theme.spaceScale[1] ?? DEFAULT_TEXT_PADDING_PT;
   const defaultBold = scale.weight >= theme.type.weightBold;
+  const lower = regionName.toLowerCase();
+  const isSubtitle = lower.includes("subtitle");
+  const isTitleLike = (lower.includes("title") || lower.includes("header")) && !isSubtitle;
+  const slotMin =
+    isTitleLike
+      ? MIN_TITLE_FONT_PT
+      : lower.includes("caption") || lower.includes("footer") || lower.includes("note")
+        ? DEFAULT_MIN_FONT
+        : MIN_BODY_FONT_PT;
   return {
     fontFace: scale.family,
-    fontSize: baseSize,
-    minFont: style?.minFont ?? DEFAULT_MIN_FONT,
+    fontSize: style?.fontSize ?? baseSize,
+    minFont: Math.max(style?.minFont ?? DEFAULT_MIN_FONT, slotMin),
     fit: style?.fit ?? "shrink",
     lineHeight: style?.lineHeight ?? 1.2,
     paddingPt: style?.paddingPt ?? defaultPadding,
@@ -299,7 +311,7 @@ export function prepareTextElement(args: {
     );
   }
 
-  let content = args.element.content;
+  let content = normalizeText(args.element.content ?? "");
   let fontSize = style.fontSize;
   let estimate = estimateTextLayout({
     text: content,
diff --git a/src/render/types.ts b/src/render/types.ts
index 9e9e870..4710549 100644
--- a/src/render/types.ts
+++ b/src/render/types.ts
@@ -43,6 +43,7 @@ export interface TextElement {
 }
 
 export type ListBulletStyle = "dot" | "number" | "icon" | "none";
+export type FlowLayoutProfile = "flow.chevron" | "flow.card";
 
 export interface ListBulletSpec {
   size?: "sm" | "md";
@@ -85,6 +86,7 @@ export interface CardStyleSpec {
   border?: "default" | "subtle" | "none";
   radius?: "sm" | "md" | "lg";
   padding?: "sm" | "md" | "lg";
+  paddingPt?: number;
   shadow?: "none" | "sm";
   accent?: CardStyleAccent;
 }
@@ -105,6 +107,7 @@ export interface CardElement {
   type: "card";
   region: string;
   variant?: "surface" | "elevated" | "accent";
+  layoutProfile?: FlowLayoutProfile;
   style?: CardStyleSpec;
   header?: CardHeaderSpec;
   body: Array<ListSpec & { type: "list" }>;
@@ -192,6 +195,20 @@ export interface ChartElement {
   z?: number;
 }
 
+export interface ChevronFlowStep {
+  label: string;
+  icon?: string;
+}
+
+export interface ChevronFlowElement {
+  type: "chevron_flow";
+  region: string;
+  steps: ChevronFlowStep[];
+  orientation?: "horizontal";
+  layoutProfile?: FlowLayoutProfile;
+  z?: number;
+}
+
 export interface NodeElement {
   type: "node";
   id: string;
@@ -318,6 +335,7 @@ export type Element =
   | CardElement
   | TableElement
   | ChartElement
+  | ChevronFlowElement
   | NodeElement
   | EdgeElement
   | CalloutElement
@@ -484,6 +502,41 @@ export interface PreparedChartElement {
   overlays?: PreparedChartOverlayLine[];
 }
 
+export interface PreparedChevronStep {
+  bbox: BBox;
+  points: Array<{ x: number; y: number; moveTo?: boolean } | { close: true }>;
+  fill: string;
+  stroke: string;
+  text: {
+    value: string;
+    bbox: BBox;
+    fontFace: string;
+    fontSize: number;
+    bold: boolean;
+    color: string;
+  };
+  icon?: { bbox: BBox; data: string };
+  textOverflow?: boolean;
+}
+
+export interface PreparedChevronFlowElement {
+  kind: "chevron_flow";
+  z: number;
+  order: number;
+  id: string;
+  region: string;
+  bbox: BBox;
+  steps: PreparedChevronStep[];
+  layoutProfile?: FlowLayoutProfile;
+  metrics?: {
+    groupBBox: BBox;
+    notchIn: number;
+    tipIn: number;
+    gapIn: number;
+    stepCount: number;
+  };
+}
+
 export interface PreparedChartOverlayLine {
   kind: "average" | "trend";
   start: { x: number; y: number };
@@ -530,6 +583,13 @@ export interface PreparedListLayout {
     color: string;
   };
   totalHeightPt: number;
+  metrics?: {
+    textStartX: number;
+    textBoxX: number;
+    hangingPt: number;
+    leftPt: number;
+    numberedInline: boolean;
+  };
 }
 
 export interface PreparedListElement extends PreparedListLayout {
@@ -547,6 +607,7 @@ export interface PreparedCardElement {
   id: string;
   region: string;
   bbox: BBox;
+  layoutProfile?: FlowLayoutProfile;
   style: {
     fill: string;
     border: string;
@@ -588,6 +649,11 @@ export interface PreparedCardElement {
     textBox?: BBox;
     stripFill?: string;
   };
+  metrics?: {
+    innerHeightPt: number;
+    contentHeightPt: number;
+    bodyUsedPt: number;
+  };
 }
 
 export interface PreparedCalloutElement {
@@ -625,6 +691,8 @@ export interface PreparedConnectorElement {
   lineEnd?: { x: number; y: number };
   style: { widthPt: number; color: string; startArrow: "none" | "triangle"; endArrow: "none" | "triangle" };
   arrowHeads?: ArrowHead[];
+  customArrowheads?: boolean;
+  arrowSizePt?: number;
   lineRect: BBox;
   lineFlipV: boolean;
   lineFlipH: boolean;
@@ -636,6 +704,7 @@ export type PreparedElement =
   | PreparedCardElement
   | PreparedTableElement
   | PreparedChartElement
+  | PreparedChevronFlowElement
   | PreparedNodeElement
   | PreparedEdgeElement
   | PreparedCalloutElement
@@ -645,6 +714,8 @@ export type PreparedElement =
 
 export interface PreparedSlide {
   elements: PreparedElement[];
+  diagramRegionId?: string;
+  diagramRegionBBox?: BBox;
 }
 
 export interface ArrowHead {
@@ -702,6 +773,10 @@ export interface PreparedNodeElement {
     bold: boolean;
     color: string;
   };
+  metrics?: {
+    innerHeightPt: number;
+    contentHeightPt: number;
+  };
 }
 
 export interface PreparedEdgeElement {
@@ -720,5 +795,8 @@ export interface PreparedEdgeElement {
   lineRect: BBox;
   lineFlipV: boolean;
   lineFlipH: boolean;
+  metrics?: {
+    renderMode: "unified" | "split";
+  };
 }
 
diff --git a/src/render/validate.ts b/src/render/validate.ts
index 8fe7fe2..20816e4 100644
--- a/src/render/validate.ts
+++ b/src/render/validate.ts
@@ -12,6 +12,10 @@ function isVariant(value: unknown): boolean {
   return value === "surface" || value === "elevated" || value === "accent";
 }
 
+function isFlowProfile(value: unknown): boolean {
+  return value === "flow.chevron" || value === "flow.card";
+}
+
 function validateTextElementSchema(
   element: Record<string, unknown>,
   elemPrefix: string,
@@ -620,6 +624,50 @@ function validateListElementSchema(
   }
 }
 
+function validateChevronFlowElementSchema(
+  element: Record<string, unknown>,
+  elemPrefix: string,
+  strict: boolean,
+  errors: string[]
+): void {
+  if ("x" in element || "y" in element || "w" in element || "h" in element) {
+    errors.push(`${elemPrefix} absolute_position_forbidden`);
+  }
+  const orientation = element.orientation;
+  if (typeof orientation !== "undefined" && orientation !== "horizontal") {
+    errors.push(`${elemPrefix} chevron_orientation_invalid`);
+  }
+  if (typeof element.layoutProfile !== "undefined" && !isFlowProfile(element.layoutProfile)) {
+    errors.push(`${elemPrefix} flow_profile_invalid`);
+  }
+  if (!Array.isArray(element.steps) || element.steps.length === 0) {
+    errors.push(`${elemPrefix} chevron_steps_invalid`);
+  } else {
+    element.steps.forEach((rawStep: unknown, idx: number) => {
+      if (!isPlainObject(rawStep)) {
+        errors.push(`${elemPrefix} chevron_step_invalid (${idx + 1})`);
+        return;
+      }
+      const step = rawStep as Record<string, unknown>;
+      if (typeof step.label !== "string") {
+        errors.push(`${elemPrefix} chevron_step_invalid (${idx + 1})`);
+      }
+      if (typeof step.icon !== "undefined" && typeof step.icon !== "string") {
+        errors.push(`${elemPrefix} chevron_step_invalid (${idx + 1})`);
+      }
+    });
+  }
+
+  if (strict) {
+    const allowedFields = new Set(["type", "region", "steps", "orientation", "layoutProfile", "z"]);
+    for (const key of Object.keys(element)) {
+      if (!allowedFields.has(key)) {
+        errors.push(`${elemPrefix} Unknown field '${key}'`);
+      }
+    }
+  }
+}
+
 function validateNodeElementSchema(
   element: Record<string, unknown>,
   elemPrefix: string,
@@ -728,6 +776,9 @@ function validateCardElementSchema(
   if (typeof element.variant !== "undefined" && !["surface", "elevated", "accent"].includes(String(element.variant))) {
     errors.push(`${elemPrefix} style_variant_invalid`);
   }
+  if (typeof element.layoutProfile !== "undefined" && !isFlowProfile(element.layoutProfile)) {
+    errors.push(`${elemPrefix} flow_profile_invalid`);
+  }
   if (typeof element.style !== "undefined") {
     if (!isPlainObject(element.style)) {
       errors.push(`${elemPrefix} card_style_invalid`);
@@ -748,6 +799,12 @@ function validateCardElementSchema(
       if (typeof style.padding !== "undefined" && !["sm", "md", "lg"].includes(String(style.padding))) {
         errors.push(`${elemPrefix} card_style_invalid`);
       }
+      if (
+        typeof style.paddingPt !== "undefined" &&
+        (typeof style.paddingPt !== "number" || !Number.isFinite(style.paddingPt) || style.paddingPt < 0)
+      ) {
+        errors.push(`${elemPrefix} card_style_invalid`);
+      }
       if (typeof style.shadow !== "undefined" && !["none", "sm"].includes(String(style.shadow))) {
         errors.push(`${elemPrefix} card_style_invalid`);
       }
@@ -822,7 +879,17 @@ function validateCardElementSchema(
   }
 
   if (strict) {
-    const allowedFields = new Set(["type", "region", "variant", "style", "header", "body", "footer", "z"]);
+    const allowedFields = new Set([
+      "type",
+      "region",
+      "variant",
+      "layoutProfile",
+      "style",
+      "header",
+      "body",
+      "footer",
+      "z",
+    ]);
     for (const key of Object.keys(element)) {
       if (!allowedFields.has(key)) {
         errors.push(`${elemPrefix} Unknown field '${key}'`);
@@ -1298,7 +1365,20 @@ export function validateSpec(spec: unknown, strict: boolean): { valid: boolean;
         return;
       }
       if (
-        !["text", "list", "card", "table", "chart", "node", "edge", "callout", "connector", "image", "icon"].includes(
+        ![
+          "text",
+          "list",
+          "card",
+          "table",
+          "chart",
+          "chevron_flow",
+          "node",
+          "edge",
+          "callout",
+          "connector",
+          "image",
+          "icon",
+        ].includes(
           element.type
         )
       ) {
@@ -1330,6 +1410,9 @@ export function validateSpec(spec: unknown, strict: boolean): { valid: boolean;
       if (element.type === "chart") {
         validateChartElementSchema(element, elemPrefix, strict, errors);
       }
+      if (element.type === "chevron_flow") {
+        validateChevronFlowElementSchema(element, elemPrefix, strict, errors);
+      }
       if (element.type === "node") {
         validateNodeElementSchema(element, elemPrefix, strict, errors);
       }
diff --git a/src/templates/compiler.ts b/src/templates/compiler.ts
index 155f9e7..c47135a 100644
--- a/src/templates/compiler.ts
+++ b/src/templates/compiler.ts
@@ -6,6 +6,7 @@ import type {
   TextElement,
   TableElement,
   ChartElement,
+  ChevronFlowElement,
   CardElement,
   CalloutElement,
   ConnectorElement,
@@ -59,6 +60,7 @@ const PLACEHOLDER_KINDS = new Set([
   "list",
   "table",
   "chart",
+  "chevron_flow",
   "card",
   "callout",
   "connector",
@@ -1077,6 +1079,13 @@ function parseCardStyleSpec(
     }
     parsed.padding = style.padding as any;
   }
+  if (typeof style.paddingPt !== "undefined") {
+    if (typeof style.paddingPt !== "number" || !Number.isFinite(style.paddingPt) || style.paddingPt < 0) {
+      pushCardFillError(prefix, errors);
+      return null;
+    }
+    parsed.paddingPt = style.paddingPt as number;
+  }
   if (typeof style.shadow !== "undefined") {
     if (!["none", "sm"].includes(String(style.shadow))) {
       pushCardFillError(prefix, errors);
@@ -1629,11 +1638,16 @@ export function compileTemplateSpec(args: {
           if (kindValue === "card") {
             validateItemFields(
               itemObj,
-              new Set(["kind", "variant", "style", "header", "body", "footer"]),
+              new Set(["kind", "variant", "style", "header", "body", "footer", "paddingSlot"]),
               itemPrefix,
               args.strict,
               errors
             );
+            const paddingSlot = resolvePaddingSlot(
+              resolveSlot(itemObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
+              itemPrefix,
+              errors
+            );
             let cardVariant: CardElement["variant"] | undefined = placeholder.variant as CardElement["variant"];
             if (typeof itemObj.variant !== "undefined") {
               if (!isVariant(itemObj.variant)) {
@@ -1673,11 +1687,18 @@ export function compileTemplateSpec(args: {
             if (!cardBody) {
               return;
             }
+            let compiledCardStyle = cardStyle ? { ...cardStyle } : undefined;
+            if (typeof paddingSlot !== "undefined") {
+              compiledCardStyle = {
+                ...(compiledCardStyle ?? {}),
+                paddingPt: args.theme.spaceScale[paddingSlot],
+              };
+            }
             elements.push({
               type: "card",
               region: regionId,
               variant: cardVariant,
-              style: cardStyle ?? undefined,
+              style: compiledCardStyle,
               header: cardHeader ?? undefined,
               body: cardBody,
               footer: cardFooter ?? undefined,
@@ -2016,7 +2037,7 @@ export function compileTemplateSpec(args: {
           continue;
         }
         if (args.strict) {
-          const allowedFields = new Set(["variant", "style", "header", "body", "footer"]);
+          const allowedFields = new Set(["variant", "style", "header", "body", "footer", "paddingSlot"]);
           for (const key of Object.keys(fillObj)) {
             if (!allowedFields.has(key)) {
               pushCardFillError(placeholderPrefix, errors);
@@ -2035,6 +2056,11 @@ export function compileTemplateSpec(args: {
           }
           cardVariant = fillObj.variant as CardElement["variant"];
         }
+        const paddingSlot = resolvePaddingSlot(
+          resolveSlot(fillObj.paddingSlot as any, placeholder.styleSlots?.padding, template.defaultSlots?.padding),
+          placeholderPrefix,
+          errors
+        );
         const cardStyle =
           typeof fillObj.style === "undefined"
             ? undefined
@@ -2067,11 +2093,18 @@ export function compileTemplateSpec(args: {
           continue;
         }
         const regionId = contentRegionId ?? placeholder.id;
+        let compiledCardStyle = cardStyle ? { ...cardStyle } : undefined;
+        if (typeof paddingSlot !== "undefined") {
+          compiledCardStyle = {
+            ...(compiledCardStyle ?? {}),
+            paddingPt: args.theme.spaceScale[paddingSlot],
+          };
+        }
         const element: CardElement = {
           type: "card",
           region: regionId,
           variant: cardVariant,
-          style: cardStyle ?? undefined,
+          style: compiledCardStyle,
           header: cardHeader ?? undefined,
           body: cardBody,
           footer: cardFooter ?? undefined,
@@ -2190,6 +2223,85 @@ export function compileTemplateSpec(args: {
         continue;
       }
 
+      if (placeholder.kind === "chevron_flow") {
+        if (typeof fill === "undefined") {
+          continue;
+        }
+        if (!fillObj) {
+          continue;
+        }
+        validateFillFields(
+          fillObj,
+          new Set(["steps", "orientation", "layoutProfile"]),
+          placeholderPrefix,
+          args.strict,
+          errors
+        );
+        if (!Array.isArray(fillObj.steps) || fillObj.steps.length === 0) {
+          errors.push(`${placeholderPrefix} template_fill_invalid`);
+          continue;
+        }
+        const steps: ChevronFlowElement["steps"] = [];
+        for (const [stepIdx, stepRaw] of (fillObj.steps as unknown[]).entries()) {
+          if (!isPlainObject(stepRaw)) {
+            errors.push(`${placeholderPrefix} template_fill_invalid`);
+            steps.length = 0;
+            break;
+          }
+          const step = stepRaw as Record<string, unknown>;
+          if (typeof step.label !== "string") {
+            errors.push(`${placeholderPrefix} template_fill_invalid`);
+            steps.length = 0;
+            break;
+          }
+          if (typeof step.icon !== "undefined" && typeof step.icon !== "string") {
+            errors.push(`${placeholderPrefix} template_fill_invalid`);
+            steps.length = 0;
+            break;
+          }
+          steps.push({
+            label: step.label,
+            icon: typeof step.icon === "string" ? step.icon : undefined,
+          });
+          if (args.strict) {
+            for (const key of Object.keys(step)) {
+              if (!new Set(["label", "icon"]).has(key)) {
+                errors.push(`${placeholderPrefix} template_fill_invalid`);
+                steps.length = 0;
+                break;
+              }
+            }
+          }
+          if (steps.length === 0 && stepIdx < (fillObj.steps as unknown[]).length - 1) {
+            break;
+          }
+        }
+        if (steps.length === 0) {
+          continue;
+        }
+        const orientation = typeof fillObj.orientation === "string" ? fillObj.orientation : undefined;
+        if (typeof orientation !== "undefined" && orientation !== "horizontal") {
+          errors.push(`${placeholderPrefix} template_fill_invalid`);
+          continue;
+        }
+        const layoutProfile = typeof fillObj.layoutProfile === "string" ? fillObj.layoutProfile : undefined;
+        if (typeof layoutProfile !== "undefined" && layoutProfile !== "flow.chevron" && layoutProfile !== "flow.card") {
+          errors.push(`${placeholderPrefix} template_fill_invalid`);
+          continue;
+        }
+        const regionId = contentRegionId ?? placeholder.id;
+        const element: ChevronFlowElement = {
+          type: "chevron_flow",
+          region: regionId,
+          steps,
+          orientation: orientation as ChevronFlowElement["orientation"],
+          layoutProfile: layoutProfile as ChevronFlowElement["layoutProfile"],
+          z,
+        };
+        elements.push(element);
+        continue;
+      }
+
       if (placeholder.kind === "image") {
         if (typeof fill === "undefined") {
           continue;
diff --git a/src/templates/types.ts b/src/templates/types.ts
index 98cdb5d..9e08a9a 100644
--- a/src/templates/types.ts
+++ b/src/templates/types.ts
@@ -6,6 +6,7 @@ export type TemplateKind =
   | "list"
   | "table"
   | "chart"
+  | "chevron_flow"
   | "card"
   | "callout"
   | "connector"
```
Command:
```bash
git diff --no-index -- NUL src/render/chevron.ts
```
Output:
```text
diff --git a/src/render/chevron.ts b/src/render/chevron.ts
new file mode 100644
index 0000000..47e322d
--- /dev/null
+++ b/src/render/chevron.ts
@@ -0,0 +1,373 @@
+import type { BBox, ChevronFlowElement, PreparedChevronFlowElement, PreparedChevronStep } from "./types.js";
+import type { ConcreteTheme } from "../theme/types.js";
+import { estimateTextLayout } from "./text.js";
+import { EPSILON_INCHES, ptToIn, roundInches } from "./utils/units.js";
+import { resolveIconData } from "./utils/icons.js";
+import { normalizeColor } from "./utils/color.js";
+import { normalizeText } from "./utils/textRuns.js";
+import { computeFlowLayout } from "./flow.js";
+
+const DEFAULT_LINE_HEIGHT = 1.2;
+
+function computeStepPoints(args: {
+  x: number;
+  y: number;
+  width: number;
+  height: number;
+  notch: number;
+  tip: number;
+  isFirst: boolean;
+  isLast: boolean;
+}): { bbox: BBox; points: Array<{ x: number; y: number; moveTo?: boolean } | { close: true }> } {
+  const x0 = args.x;
+  const y0 = args.y;
+  const x1 = args.x + args.width;
+  const y1 = args.y + args.height;
+  const ym = args.y + args.height / 2;
+
+  const leftNotch = args.isFirst ? 0 : args.notch;
+  const rightTip = args.isLast ? 0 : args.tip;
+  const includeNotch = !args.isFirst && leftNotch > EPSILON_INCHES;
+
+  const points: Array<{ x: number; y: number; moveTo?: boolean } | { close: true }> = [];
+  points.push({ x: x0, y: y0, moveTo: true });
+  if (!args.isLast) {
+    points.push({ x: x1 - rightTip, y: y0 });
+    points.push({ x: x1, y: ym });
+    points.push({ x: x1 - rightTip, y: y1 });
+  } else {
+    points.push({ x: x1, y: y0 });
+    points.push({ x: x1, y: y1 });
+  }
+  points.push({ x: x0, y: y1 });
+  if (includeNotch) {
+    points.push({ x: x0 + leftNotch, y: ym });
+  }
+  points.push({ close: true });
+
+  return {
+    bbox: { x: x0, y: y0, width: args.width, height: args.height },
+    points,
+  };
+}
+
+function resolveStepFill(theme: ConcreteTheme, index: number): string {
+  const palette = theme.chart.palette || [];
+  if (palette.length > 0) {
+    return palette[index % palette.length];
+  }
+  return theme.module.fill;
+}
+
+function clamp(value: number, min: number, max: number): number {
+  return Math.max(min, Math.min(max, value));
+}
+
+export function prepareChevronFlowElement(args: {
+  slideIndex: number;
+  elementIndex: number;
+  element: ChevronFlowElement;
+  bbox: BBox;
+  z: number;
+  order: number;
+  id: string;
+  theme: ConcreteTheme;
+  hardErrors: string[];
+}): PreparedChevronFlowElement {
+  const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
+  const CHEVRON_TIP_DEPTH_RATIO_MAX = 0.25;
+  const CHEVRON_TIP_DEPTH_MAX_IN = 0.24;
+  const CHEVRON_MIN_TEXT_PADDING_EXTRA_PT = 2;
+  const orientation = args.element.orientation ?? "horizontal";
+  if (orientation !== "horizontal") {
+    args.hardErrors.push(`${prefix} chevron_orientation_invalid`);
+  }
+
+  const stepsSpec = Array.isArray(args.element.steps) ? args.element.steps : [];
+  if (stepsSpec.length === 0) {
+    args.hardErrors.push(`${prefix} chevron_steps_invalid`);
+  }
+
+  const chevronProfile = args.theme.flowProfiles.flowChevron;
+  const paddingXPt = chevronProfile.innerPadXPt;
+  const paddingYPt = chevronProfile.innerPadYPt;
+  const paddingXIn = ptToIn(paddingXPt);
+  const paddingYIn = ptToIn(paddingYPt);
+
+  const flowLayout = computeFlowLayout({
+    region: args.bbox,
+    count: stepsSpec.length,
+    orientation: "horizontal",
+    kind: "chevron",
+    theme: args.theme,
+    layoutProfile: args.element.layoutProfile,
+  });
+  const gapIn = flowLayout.gapX;
+
+  if (flowLayout.stepW <= 0 || flowLayout.stepH <= 0) {
+    args.hardErrors.push(`${prefix} chevron_overflow`);
+  }
+
+  const rawTipIn = Math.min(flowLayout.stepH * CHEVRON_TIP_DEPTH_RATIO_MAX, CHEVRON_TIP_DEPTH_MAX_IN);
+  const minTextPaddingIn = ptToIn(paddingXPt * 2 + CHEVRON_MIN_TEXT_PADDING_EXTRA_PT);
+  const maxTipIn = Math.max(0, flowLayout.stepW - minTextPaddingIn);
+  const tipIn = clamp(rawTipIn, 0, maxTipIn);
+  const useTrapezoidFallback = flowLayout.stepW < (2 * tipIn + minTextPaddingIn);
+  const notchIn = useTrapezoidFallback ? 0 : tipIn;
+
+  const font = args.theme.fontScale.body;
+  const bold = font.weight >= args.theme.type.weightBold;
+  const textPaddingXIn = ptToIn(paddingXPt);
+  const textPaddingYIn = ptToIn(paddingYPt);
+  const iconSizeTargetPt = args.theme.chevron.step.iconSizePt;
+  const iconMinPt = args.theme.chevron.step.iconMinSizePt;
+  const iconGapPt = args.theme.chevron.step.iconGapPt;
+  const iconSizePt = Math.max(iconSizeTargetPt, iconMinPt);
+  const iconSizeIn = ptToIn(iconSizePt);
+
+  const preparedSteps: PreparedChevronStep[] = [];
+
+  stepsSpec.forEach((stepSpec, idx) => {
+    const stepLayout = flowLayout.steps[idx];
+    const stepX = stepLayout?.x ?? args.bbox.x;
+    const stepY = stepLayout?.y ?? args.bbox.y;
+    const isFirst = idx === 0;
+    const isLast = idx === stepsSpec.length - 1;
+    const { bbox: stepBox, points } = computeStepPoints({
+      x: stepX,
+      y: stepY,
+      width: stepLayout?.width ?? flowLayout.stepW,
+      height: stepLayout?.height ?? flowLayout.stepH,
+      notch: notchIn,
+      tip: tipIn,
+      isFirst,
+      isLast,
+    });
+
+    const leftInset = (isFirst ? 0 : notchIn) + textPaddingXIn;
+    const rightInset = (isLast ? 0 : tipIn) + textPaddingXIn;
+    const contentBox: BBox = {
+      x: stepBox.x + leftInset,
+      y: stepBox.y + textPaddingYIn,
+      width: Math.max(0, stepBox.width - leftInset - rightInset),
+      height: Math.max(0, stepBox.height - textPaddingYIn * 2),
+    };
+
+    let iconBox: PreparedChevronStep["icon"] | undefined;
+    let labelBox: BBox = contentBox;
+    let labelValue = typeof stepSpec.label === "string" ? normalizeText(stepSpec.label) : "";
+    let overflow = false;
+
+    if (stepSpec.icon) {
+      const availableHeightPt = contentBox.height * 72;
+      const availableWidthPt = contentBox.width * 72;
+      if (
+        availableHeightPt < iconMinPt - 0.01 ||
+        availableWidthPt < iconMinPt - 0.01 ||
+        iconSizePt > availableHeightPt + 0.01 ||
+        iconSizePt > availableWidthPt + 0.01
+      ) {
+        args.hardErrors.push(`${prefix} chevron_icon_too_small`);
+      }
+      const labelHeightBudgetPt = availableHeightPt - iconSizePt - iconGapPt;
+      if (labelHeightBudgetPt <= 0) {
+        args.hardErrors.push(`${prefix} chevron_text_overflow`);
+        overflow = true;
+      }
+      const labelBoxCandidate: BBox = {
+        x: contentBox.x,
+        y: contentBox.y,
+        width: contentBox.width,
+        height: Math.max(0, labelHeightBudgetPt / 72),
+      };
+      const estimate = estimateTextLayout({
+        text: labelValue,
+        fontSize: font.size,
+        bold,
+        bbox: labelBoxCandidate,
+        paddingPt: 0,
+        lineHeight: DEFAULT_LINE_HEIGHT,
+      });
+      if (estimate.overflowHeight || estimate.overflowWidth) {
+        args.hardErrors.push(`${prefix} chevron_text_overflow`);
+        overflow = true;
+      }
+      labelValue = estimate.wrappedLines.join("\n");
+      const labelHeightIn = estimate.requiredHeightPt / 72;
+      const totalContentPt = iconSizePt + iconGapPt + estimate.requiredHeightPt;
+      const startY = contentBox.y + ptToIn(Math.max(0, (availableHeightPt - totalContentPt) / 2));
+      labelBox = {
+        x: contentBox.x,
+        y: startY + ptToIn(iconSizePt + iconGapPt),
+        width: contentBox.width,
+        height: Math.max(0, labelHeightIn),
+      };
+
+      const iconResult = resolveIconData({
+        name: stepSpec.icon,
+        color: normalizeColor(args.theme.text.colorPrimary, args.theme.text.colorPrimary),
+      });
+      if (iconResult.error || !iconResult.data) {
+        args.hardErrors.push(`${prefix} icon_not_found`);
+      } else {
+        iconBox = {
+          bbox: {
+            x: contentBox.x + Math.max(0, (contentBox.width - iconSizeIn) / 2),
+            y: startY,
+            width: iconSizeIn,
+            height: iconSizeIn,
+          },
+          data: iconResult.data,
+        };
+      }
+    } else {
+      const estimate = estimateTextLayout({
+        text: labelValue,
+        fontSize: font.size,
+        bold,
+        bbox: contentBox,
+        paddingPt: 0,
+        lineHeight: DEFAULT_LINE_HEIGHT,
+      });
+      if (estimate.overflowHeight || estimate.overflowWidth) {
+        args.hardErrors.push(`${prefix} chevron_text_overflow`);
+        overflow = true;
+      }
+      labelValue = estimate.wrappedLines.join("\n");
+      const labelHeightIn = estimate.requiredHeightPt / 72;
+      labelBox = {
+        x: contentBox.x,
+        y: contentBox.y + Math.max(0, (contentBox.height - labelHeightIn) / 2),
+        width: contentBox.width,
+        height: Math.max(0, labelHeightIn),
+      };
+    }
+
+    const fill = resolveStepFill(args.theme, idx);
+    const stroke = args.theme.module.stroke;
+
+    preparedSteps.push({
+      bbox: {
+        x: roundInches(stepBox.x),
+        y: roundInches(stepBox.y),
+        width: roundInches(stepBox.width),
+        height: roundInches(stepBox.height),
+      },
+      points: points.map((point) => {
+        if ("close" in point) {
+          return point;
+        }
+        return {
+          x: roundInches(point.x - stepBox.x),
+          y: roundInches(point.y - stepBox.y),
+          moveTo: point.moveTo,
+        };
+      }),
+      fill,
+      stroke,
+      text: {
+        value: labelValue,
+        bbox: {
+          x: roundInches(labelBox.x),
+          y: roundInches(labelBox.y),
+          width: roundInches(labelBox.width),
+          height: roundInches(labelBox.height),
+        },
+        fontFace: font.family,
+        fontSize: font.size,
+        bold,
+        color: args.theme.text.colorPrimary,
+      },
+      icon: iconBox
+        ? {
+            bbox: {
+              x: roundInches(iconBox.bbox.x),
+              y: roundInches(iconBox.bbox.y),
+              width: roundInches(iconBox.bbox.width),
+              height: roundInches(iconBox.bbox.height),
+            },
+            data: iconBox.data,
+          }
+        : undefined,
+      textOverflow: overflow,
+    });
+  });
+
+  const groupBBox = preparedSteps.reduce<BBox | null>((current, step) => {
+    if (!current) {
+      return { ...step.bbox };
+    }
+    const x0 = Math.min(current.x, step.bbox.x);
+    const y0 = Math.min(current.y, step.bbox.y);
+    const x1 = Math.max(current.x + current.width, step.bbox.x + step.bbox.width);
+    const y1 = Math.max(current.y + current.height, step.bbox.y + step.bbox.height);
+    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
+  }, null);
+
+  const roundedGroupBBox = groupBBox
+    ? {
+        x: roundInches(groupBBox.x),
+        y: roundInches(groupBBox.y),
+        width: roundInches(groupBBox.width),
+        height: roundInches(groupBBox.height),
+      }
+    : null;
+
+  return {
+    kind: "chevron_flow",
+    z: args.z,
+    order: args.order,
+    id: args.id,
+    region: args.element.region,
+    bbox: args.bbox,
+    steps: preparedSteps,
+    layoutProfile: args.element.layoutProfile,
+    metrics: roundedGroupBBox
+      ? {
+          groupBBox: roundedGroupBBox,
+          notchIn,
+          tipIn,
+          gapIn,
+          stepCount: preparedSteps.length,
+        }
+      : undefined,
+  };
+}
+
+export function renderChevronFlowElement(slide: any, shapeType: any, element: PreparedChevronFlowElement, theme: ConcreteTheme): void {
+  element.steps.forEach((step) => {
+    slide.addShape(shapeType.custGeom, {
+      x: step.bbox.x,
+      y: step.bbox.y,
+      w: step.bbox.width,
+      h: step.bbox.height,
+      points: step.points,
+      fill: { color: step.fill },
+      line: { color: step.stroke, width: theme.strokeScale.thin },
+    });
+    if (step.icon) {
+      slide.addImage({
+        data: step.icon.data,
+        x: step.icon.bbox.x,
+        y: step.icon.bbox.y,
+        w: step.icon.bbox.width,
+        h: step.icon.bbox.height,
+      });
+    }
+    slide.addText(step.text.value, {
+      x: step.text.bbox.x,
+      y: step.text.bbox.y,
+      w: step.text.bbox.width,
+      h: step.text.bbox.height,
+      fontFace: step.text.fontFace,
+      fontSize: step.text.fontSize,
+      bold: step.text.bold,
+      color: step.text.color,
+      align: "center",
+      valign: "middle",
+      margin: 0,
+      breakLine: true,
+      lineSpacingMultiple: DEFAULT_LINE_HEIGHT,
+    });
+  });
+}
```
## 3) Typography Failure Evidence
- Spec(s) showing bullet misalignment:
  - examples/components/bullets_alignment.json (slide #1 bullets-alignment, elements #1/#2/#3 regions dot/number/icon).
  - examples/components/list_v1.json (slide #1 list-v1, element #2 region list_dot, bold-lead wrap item).
- Observed failure mode: wrapped lines receive extra bullet markers and next-item marker appears on previous wrapped line.

Command:
```bash
npm run render -- examples/components/bullets_alignment.json out/smokes/bullets_alignment_capture.pptx
```
Output:
```text
Unknown command: "pm"

To see a list of supported npm commands, run:
  npm help
```
Command:
```bash
npm run render -- examples/components/list_v1.json out/smokes/list_v1_capture.pptx
```
Output:
```text
Unknown command: "pm"

To see a list of supported npm commands, run:
  npm help
```
Command:
```powershell
@'
import fitz
from pathlib import Path

root = Path(r"c:/Users/srira/code/PPTMCP")
out_dir = root / "docs" / "assets" / "hardening"
out_dir.mkdir(parents=True, exist_ok=True)

def render_regions(pdf_path: Path, stem: str, regions):
    doc = fitz.open(pdf_path)
    page = doc[0]
    rect = page.rect
    generated = []
    for name, (x0, y0, x1, y1) in regions.items():
        clip = fitz.Rect(rect.x0 + rect.width*x0, rect.y0 + rect.height*y0, rect.x0 + rect.width*x1, rect.y0 + rect.height*y1)
        pix = page.get_pixmap(matrix=fitz.Matrix(2,2), alpha=False, clip=clip)
        p = out_dir / f"{stem}_{name}.png"
        pix.save(p)
        generated.append(p)
    doc.close()
    return generated

files = []
files += render_regions(root / "out" / "smokes" / "bullets_alignment_capture.pdf", "bullets_alignment_capture", {
    "slide1_full": (0.0, 0.0, 1.0, 1.0),
    "dot_region": (0.0, 0.0, 0.34, 0.55),
    "number_region": (0.33, 0.0, 0.67, 0.55),
    "icon_region": (0.66, 0.0, 1.0, 0.55),
})
files += render_regions(root / "out" / "smokes" / "list_v1_capture.pdf", "list_v1_capture", {
    "slide1_full": (0.0, 0.0, 1.0, 1.0),
    "list_dot_region": (0.0, 0.14, 0.50, 0.55),
})
for p in files:
    print(str(p))
'@ | python -
```
Output:
```text
c:\Users\srira\code\PPTMCP\docs\assets\hardening\bullets_alignment_capture_slide1_full.png
c:\Users\srira\code\PPTMCP\docs\assets\hardening\bullets_alignment_capture_dot_region.png
c:\Users\srira\code\PPTMCP\docs\assets\hardening\bullets_alignment_capture_number_region.png
c:\Users\srira\code\PPTMCP\docs\assets\hardening\bullets_alignment_capture_icon_region.png
c:\Users\srira\code\PPTMCP\docs\assets\hardening\list_v1_capture_slide1_full.png
c:\Users\srira\code\PPTMCP\docs\assets\hardening\list_v1_capture_list_dot_region.png
```
- Screenshot links:
  - [bullets dot region](./assets/hardening/bullets_alignment_capture_dot_region.png)
  - [bullets number region](./assets/hardening/bullets_alignment_capture_number_region.png)
  - [bullets icon region](./assets/hardening/bullets_alignment_capture_icon_region.png)
  - [bullets full slide](./assets/hardening/bullets_alignment_capture_slide1_full.png)
  - [bold-lead wrap list region](./assets/hardening/list_v1_capture_list_dot_region.png)
  - [list_v1 full slide](./assets/hardening/list_v1_capture_slide1_full.png)
## 4) Min-Font + Overflow Policy: Where It Lives
- Validation layer:
  - src/render/validate.ts :: validateTextElementSchema -> validates style.minFont type.
  - src/render/validate.ts :: table schema validation -> validates Table style.minFont type.
  - src/render/validate.ts :: addValidationEntry/buildOverflowMessage -> records min_font and formats overflow hard-fail guidance.
- Renderer layer:
  - src/render/text.ts :: resolveTextStyle -> floor logic with DEFAULT_MIN_FONT=10, MIN_BODY_FONT_PT=14, MIN_TITLE_FONT_PT=24.
  - src/render/text.ts :: prepareTextElement -> shrink-to-minFont loop, unresolved overflow -> hard error.
  - src/render/table.ts :: resolveTableStyle + table layout loop -> DEFAULT_MIN_FONT=10, shrink loop to min, unresolved overflow -> hard error.
  - src/render/list.ts :: layoutList -> no min-font fallback; list_overflow hard-fail.
  - src/render/card.ts :: prepareCardElement -> card_overflow checks (header/body/footer), no font shrink fallback.
- Template layer constraints:
  - src/templates/compiler.ts :: validateTemplatePlaceholder -> minItems/maxItems checks.
  - src/templates/compiler.ts :: compileTemplateSpec -> enforces item-count bounds; style controls via slots (textStyleSlot/paddingSlot/strokeSlot).
Command:
```bash
rg -n "style.minFont|Table style.minFont|addValidationEntry|buildOverflowMessage|min_font|DEFAULT_MIN_FONT|MIN_BODY_FONT_PT|MIN_TITLE_FONT_PT|card_overflow|list_overflow" src/render/validate.ts src/render/text.ts src/render/table.ts src/render/list.ts src/render/card.ts src/templates/compiler.ts
```
Output:
```text
src/render/card.ts:208:    args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(Math.abs(innerH * 72))})`);
src/render/card.ts:364:        `${prefix} card_overflow (zone=footer overflowPx=${Math.round(footerContentHeightPt - footerAvailablePt)})`
src/render/card.ts:421:    args.hardErrors.push(`${prefix} card_overflow (zone=header overflowPx=${Math.round(headerHeightPt - availableHeightPt)})`);
src/render/card.ts:425:    args.hardErrors.push(`${prefix} card_overflow (zone=footer overflowPx=${Math.round(footerHeightPt - availableHeightPt)})`);
src/render/card.ts:459:    args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(bodyUsedPt - availableHeightPt)})`);
src/render/list.ts:359:    args.hardErrors.push(`${prefix}list_overflow`);
src/render/table.ts:16:import { addValidationEntry, buildOverflowMessage } from "./validate.js";
src/render/table.ts:20:const DEFAULT_MIN_FONT = 10;
src/render/table.ts:52:    minFont: style?.minFont ?? DEFAULT_MIN_FONT,
src/render/table.ts:202:  if (style.fontSize < style.minFont || style.headerFontSize < style.minFont) {
src/render/table.ts:204:      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: table font below minFont ${style.minFont}`
src/render/table.ts:233:    for (let font = style.fontSize - 1; font >= style.minFont; font -= 1) {
src/render/table.ts:234:      const candidateHeader = Math.max(style.minFont, font + Math.max(0, delta));
src/render/table.ts:253:      bodyFont = style.minFont;
src/render/table.ts:254:      headerFont = Math.max(style.minFont, style.minFont + Math.max(0, delta));
src/render/table.ts:276:  const minRowPt = style.minFont * style.lineHeight + style.cellPaddingPt * 2;
src/render/table.ts:347:  const entry = addValidationEntry({
src/render/table.ts:355:    minFont: style.minFont,
src/render/table.ts:365:            : `table overflow unresolved at minFont ${style.minFont}`,
src/render/table.ts:369:    args.hardErrors.push(buildOverflowMessage(entry));
src/render/text.ts:14:import { addValidationEntry, buildOverflowMessage } from "./validate.js";
src/render/text.ts:17:const DEFAULT_MIN_FONT = 10;
src/render/text.ts:18:const MIN_BODY_FONT_PT = 14;
src/render/text.ts:19:const MIN_TITLE_FONT_PT = 24;
src/render/text.ts:87:      ? MIN_TITLE_FONT_PT
src/render/text.ts:89:        ? DEFAULT_MIN_FONT
src/render/text.ts:90:        : MIN_BODY_FONT_PT;
src/render/text.ts:94:    minFont: Math.max(style?.minFont ?? DEFAULT_MIN_FONT, slotMin),
src/render/text.ts:308:  if (style.fontSize < style.minFont) {
src/render/text.ts:310:      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: fontSize ${style.fontSize} is below minFont ${style.minFont}`
src/render/text.ts:327:    for (let font = style.fontSize - 1; font >= style.minFont; font -= 1) {
src/render/text.ts:344:      fontSize = style.minFont;
src/render/text.ts:377:  const entry = addValidationEntry({
src/render/text.ts:385:    minFont: style.minFont,
src/render/text.ts:395:            : `overflow unresolved at minFont ${style.minFont}`,
src/render/text.ts:399:    args.hardErrors.push(buildOverflowMessage(entry));
src/render/validate.ts:40:  if (typeof style.minFont !== "undefined" && typeof style.minFont !== "number") {
src/render/validate.ts:41:    errors.push(`${elemPrefix} style.minFont must be a number`);
src/render/validate.ts:234:      if (typeof style.minFont !== "undefined" && typeof style.minFont !== "number") {
src/render/validate.ts:235:        errors.push(`${elemPrefix} Table style.minFont must be number`);
src/render/validate.ts:1486:export function addValidationEntry(args: {
src/render/validate.ts:1514:    min_font: args.minFont,
src/render/validate.ts:1523:export function buildOverflowMessage(entry: ValidationReportEntry): string {
```
## 5) Smoke Harness Inventory
### package.json scripts section (extracted)
Command:
```bash
node -e "const p=require(\"./package.json\"); console.log(JSON.stringify(p.scripts,null,2));"
```
Output:
```text
{
  "build": "tsc",
  "start": "node build/index.js",
  "dev": "tsc --watch",
  "sse": "npx supergateway --stdio \"node build/index.js\" --port 3100",
  "prepublishOnly": "npm run build",
  "render": "npm run build && node scripts/render-cli.mjs",
  "icons:lint": "node scripts/icons-lint.mjs",
  "templates:format": "node scripts/format-templates.mjs",
  "smoke:layout": "npm run build && node scripts/render-cli.mjs examples/pptmcp_case_mode_v0.1.json out/layout-smoke.pptx --no-pdf",
  "smoke:charts": "npm run build && node scripts/render-cli.mjs examples/charts_smoke.json out/charts-smoke.pptx --no-pdf --expect-error=chart_type_not_supported",
  "smoke:callouts:good": "npm run build && node scripts/render-cli.mjs examples/callouts_v0_good.json out/callouts-v0-good.pptx --no-pdf",
  "smoke:callouts:fail-anchor": "npm run build && node scripts/render-cli.mjs examples/callouts_v0_fail_anchor_type.json out/callouts-v0-fail-anchor.pptx --no-pdf --expect-error=anchor_type_not_supported",
  "smoke:callouts:fail-placement": "npm run build && node scripts/render-cli.mjs examples/callouts_v0_fail_no_placement.json out/callouts-v0-fail-placement.pptx --no-pdf --expect-error=callout_no_feasible_placement",
  "smoke:repair-lines": "npm run build && node scripts/render-cli.mjs examples/repro_repair_min.json out/repro-repair-min.pptx --no-pdf && node scripts/render-cli.mjs examples/repro_repair_no_chart.json out/repro-repair-no-chart.pptx --no-pdf && node scripts/render-cli.mjs examples/repro_repair_no_lines.json out/repro-repair-no-lines.pptx --no-pdf && node scripts/render-cli.mjs examples/repro_connector_directional.json out/repro-connector-directional.pptx --no-pdf",
  "smoke:themes": "npm run build && node scripts/render-cli.mjs examples/themes/readability_matrix.json out/readability_light.pptx --no-pdf && node scripts/render-cli.mjs examples/themes/readability_matrix_dark.json out/readability_dark.pptx --no-pdf",
  "smoke:image": "npm run build && node scripts/render-cli.mjs examples/themes/image_smoke.json out/image-smoke.pptx --no-pdf",
  "smoke:geometry-v1": "npm run build && node scripts/render-cli.mjs examples/geometry_v1_smoke.json out/geometry-v1-smoke.pptx --no-pdf",
  "smoke:geometry-arrowheads-vertical": "npm run build && node scripts/render-cli.mjs examples/smokes/geometry_arrowheads_vertical.json out/geometry-arrowheads-vertical.pptx --no-pdf",
  "smoke:geometry-arrowheads-diagonal": "npm run build && node scripts/render-cli.mjs examples/smokes/geometry_arrowheads_diagonal.json out/geometry-arrowheads-diagonal.pptx --no-pdf",
  "smoke:icons": "npm run build && node scripts/render-cli.mjs examples/smokes/icons_smoke.json out/icons-smoke.pptx --no-pdf",
  "smoke:list": "npm run build && node scripts/render-cli.mjs examples/components/list_v1.json out/smokes/list_v1.pptx --no-pdf",
  "smoke:card": "npm run build && node scripts/render-cli.mjs examples/components/card_v1.json out/smokes/card_v1.pptx --no-pdf",
  "smoke:line-chart": "npm run build && node scripts/render-cli.mjs examples/components/line_chart_v01.json out/smokes/line_chart_v01.pptx --no-pdf",
  "smoke:list:fail-icon": "npm run build && node scripts/render-cli.mjs examples/components/list_invalid_icon.json out/smokes/list_invalid_icon.pptx --no-pdf --expect-error=icon_not_found",
  "smoke:bullets": "npm run build && node scripts/render-cli.mjs examples/components/bullets_gallery.json out/smokes/bullets_gallery.pptx --no-pdf",
  "smoke:bullets:alignment": "npm run build && node scripts/render-cli.mjs examples/components/bullets_alignment.json out/smokes/bullets_alignment.pptx --no-pdf && node scripts/render-cli.mjs examples/components/bullets_alignment_large.json out/smokes/bullets_alignment_large.pptx --no-pdf",
  "smoke:cards-nested": "npm run build && node scripts/render-cli.mjs examples/components/cards_nested.json out/smokes/cards_nested_light.pptx --no-pdf && node scripts/render-cli.mjs examples/components/cards_nested_dark.json out/smokes/cards_nested_dark.pptx --no-pdf",
  "smoke:callouts:icon": "npm run build && node scripts/render-cli.mjs examples/components/callout_icon.json out/smokes/callout_icon.pptx --no-pdf",
  "smoke:card:overflow": "npm run build && node scripts/render-cli.mjs examples/components/card_overflow.json out/smokes/card_overflow.pptx --no-pdf --expect-error=card_overflow",
  "smoke:chart:mismatch": "npm run build && node scripts/render-cli.mjs examples/components/chart_mismatch.json out/smokes/chart_mismatch.pptx --no-pdf --expect-error=chart_data_length_mismatch",
  "smoke:charts:overlays": "npm run build && node scripts/render-cli.mjs examples/components/line_chart_overlays_v02.json out/smokes/line_chart_overlays_v02.pptx --no-pdf",
  "smoke:diagram": "npm run build && node scripts/render-cli.mjs examples/smokes/diagram_v1_light.json out/smokes/diagram_v1_light.pptx --no-pdf && node scripts/render-cli.mjs examples/smokes/diagram_v1_dark.json out/smokes/diagram_v1_dark.pptx --no-pdf",
  "smoke:templates": "npm run build && node scripts/render-cli.mjs examples/templates_smoke.json out/templates-smoke-light.pptx --no-pdf && node scripts/render-cli.mjs examples/templates_smoke_dark.json out/templates-smoke-dark.pptx --no-pdf",
  "smoke:themes-stress": "npm run build && node scripts/smoke-themes-stress.mjs",
  "smoke:templates-v1": "npm run build && node scripts/smoke-templates-v1.mjs",
  "smoke:chevron-width-stress": "npm run build && node scripts/smoke-chevron-width-stress.mjs",
  "smoke:card-padding-matrix": "npm run build && node scripts/render-cli.mjs examples/smoke/card_padding_matrix.json out/smokes/card_padding_matrix.pptx --no-pdf",
  "smoke:tables:comparison": "npm run build && node scripts/render-cli.mjs examples/components/table_comparison_light.json out/smokes/table_comparison_light.pptx --no-pdf && node scripts/render-cli.mjs examples/components/table_comparison_dark.json out/smokes/table_comparison_dark.pptx --no-pdf",
  "smoke:full": "npm run smoke:layout && npm run smoke:themes-stress && npm run smoke:templates-v1 && npm run smoke:chevron-width-stress && npm run smoke:card-padding-matrix && npm run smoke:diagram && npm run smoke:tables:comparison && npm run smoke:charts && npm run smoke:charts:overlays && npm run smoke:bullets && npm run smoke:bullets:alignment && npm run smoke:callouts:good && npm run smoke:callouts:fail-anchor && npm run smoke:callouts:fail-placement && npm run smoke:callouts:icon && npm run smoke:icons"
}
```
### examples/smoke tree
Command:
```powershell
Get-ChildItem examples/smoke -Recurse
```
Output:
```text


    Directory: C:\Users\srira\code\PPTMCP\examples\smoke


Mode                 LastWriteTime         Length Name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
----                 -------------         ------ ----                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
-a----         2/20/2026   5:36 PM          20390 card_padding_matrix.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
-a----         2/20/2026   5:35 PM           1725 chevron_width_stress.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
-a----         2/20/2026   5:35 PM           1733 chevron_width_stress_dark.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
-a----         2/20/2026   5:38 PM          82568 templates_v1_dark.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
-a----         2/20/2026   5:38 PM          82568 templates_v1_light.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
```
### scripts matching smoke
Command:
```powershell
Get-ChildItem scripts -Name | Select-String -Pattern "smoke"
```
Output:
```text

smoke-chevron-width-stress.mjs
smoke-templates-v1.mjs
smoke-themes-stress.mjs
```
- Smoke runner JS files and what each runs:
  - scripts/smoke-themes-stress.mjs: renders themes_stress light/dark to out/themes-stress-*.pptx and asserts geometry parity + no text shrink.
  - scripts/smoke-templates-v1.mjs: renders templates_v1 light/dark to out/smokes/templates_v1_*.pptx and asserts region geometry parity.
  - scripts/smoke-chevron-width-stress.mjs: renders chevron_width_stress light/dark to out/smokes/chevron_width_stress_*.pptx and asserts chevron metrics/points parity.
- Execution order assumptions: smoke:full uses package.json order chained by &&, making order explicit and serial.
- Output paths used: out/, out/smokes/, out/demos/.
## 6) chevron_flow: Schema + Real Usage
- Template path: src/templates/config/analysis_5_col.json
Inline snippet: chevron_flow placeholder definition
```json
{
  "id": "headers",
  "kind": "chevron_flow",
  "region": { "col": 0, "row": 1, "colSpan": 12, "rowSpan": 1 },
  "allowedKinds": ["chevron_flow"],
  "minItems": 1,
  "maxItems": 1,
  "layoutMode": "single"
}
```
- Fill payload path: examples/demos/eps_forecast_comparison.json
Inline snippet: fill payload used
```json
{
  "id": "slide-1",
  "template": "analysis_5_col",
  "fills": {
    "headers": {
      "steps": [
        { "label": "Q4-2025 EPS Forecast" },
        { "label": "Scenario Comparison" },
        { "label": "Reliability Assessment" },
        { "label": "Economic Interpretation" },
        { "label": "Conclusion" }
      ]
    }
  }
}
```
- Validation rules currently applied: chevron_orientation_invalid, chevron_steps_invalid, flow_profile_invalid, strict unknown-field rejection.
- Defaults in compiler vs renderer: compiler validates fill keys and passes orientation/layoutProfile; renderer defaults orientation to horizontal and computeFlowLayout defaults profile to flow.chevron for chevron kind.
Command:
```bash
rg -n "validateChevronFlowElementSchema|chevron_orientation_invalid|chevron_steps_invalid|flow_profile_invalid|placeholder.kind === \"chevron_flow\"|new Set\(\[\"steps\", \"orientation\", \"layoutProfile\"\]\)" src/render/validate.ts src/templates/compiler.ts src/render/chevron.ts src/render/flow.ts
```
Output:
```text
rg.exe : rg: Set\(\[\steps\,: The system cannot find the path specified. (os error 3)
At line:73 char:28
+ ... t = AsText (& rg -n "validateChevronFlowElementSchema|chevron_orienta ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (rg: Set\(\[\ste...d. (os error 3):String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
rg: \orientation\,: The system cannot find the path specified. (os error 3)
rg: \layoutProfile\\]\) src/render/validate.ts src/templates/compiler.ts src/render/chevron.ts src/render/flow.ts: The system cannot find the path specified. (os error 3)
```
## 7) Geometry: Arrowhead Threshold Behavior
- Exact threshold location: src/render/connector.ts uses ARROW_SCALE_MIN = 0.8 in computeLineWithArrowheads; scale < 0.8 returns error line_too_short.
- Error conversion path: src/render/geometry.ts resolveConnectorGeometry/resolveCalloutLeaderGeometry consumes arrowMeta.error and pushes hard error text including line_too_short.
Command:
```bash
rg -n "ARROW_SCALE_MIN|scale < ARROW_SCALE_MIN|line_too_short|computeLineWithArrowheads|resolveConnectorGeometry|arrowMeta.error|customArrowheads" src/render/connector.ts src/render/geometry.ts src/render/slide.ts
```
Output:
```text
src/render/geometry.ts:2:import { computeLineWithArrowheads, lineRectFromPoints, normalizeLineRect } from "./connector.js";
src/render/geometry.ts:131:function resolveConnectorGeometry(
src/render/geometry.ts:148:  if (element.customArrowheads) {
src/render/geometry.ts:149:    const arrowMeta = computeLineWithArrowheads({
src/render/geometry.ts:160:    if (arrowMeta.error) {
src/render/geometry.ts:161:      hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
src/render/geometry.ts:225:  const arrowMeta = computeLineWithArrowheads({
src/render/geometry.ts:235:  if (arrowMeta.error) {
src/render/geometry.ts:236:    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
src/render/geometry.ts:351:        resolveConnectorGeometry(element, slideIndex, args.warnings, args.hardErrors);
src/render/connector.ts:13:const ARROW_SCALE_MIN = 0.8;
src/render/connector.ts:135:    return { rect: { x, y, width: w, height: h }, error: "line_too_short", dx, dy, flipV, flipH };
src/render/connector.ts:140:export function computeLineWithArrowheads(args: {
src/render/connector.ts:189:      if (scale < ARROW_SCALE_MIN) {
src/render/connector.ts:194:          error: "line_too_short",
src/render/connector.ts:213:      if (scale < ARROW_SCALE_MIN) {
src/render/connector.ts:218:          error: "line_too_short",
src/render/connector.ts:349:    customArrowheads: flowActive && Boolean(flowArrowSizePt),
src/render/connector.ts:358:  const useCustom = element.customArrowheads && element.arrowHeads && element.arrowHeads.length > 0;
```
- Near-threshold test proposal (not implemented):
```json
{
  "title": "Arrow Threshold Probe",
  "slides": [
    {
      "id": "probe",
      "grid": { "cols": 12, "rows": 8, "gutter": 0.05 },
      "regions": {
        "canvas": { "col": 0, "row": 0, "colSpan": 12, "rowSpan": 8 },
        "a": { "col": 5, "row": 4, "colSpan": 1, "rowSpan": 1 },
        "b": { "col": 6, "row": 4, "colSpan": 1, "rowSpan": 1 }
      },
      "elements": [
        {
          "type": "connector",
          "region": "canvas",
          "start": { "type": "region", "targetRegion": "a", "point": "e" },
          "end": { "type": "region", "targetRegion": "b", "point": "w" },
          "style": { "widthPt": 2, "endArrow": "triangle" }
        }
      ]
    }
  ]
}
```
- Expected result: choose geometry with arrow scale around 0.81 => pass silently; reduce below 0.80 => hard fail with line_too_short.
## 8) Output Artifact Index (Paths)
Command:
```powershell
$paths = @(...); foreach ($p in $paths) { if (Test-Path $p) { ... } else { ... } }
```
Output:
```text
EXISTS	out/eps_forecast_comparison_v2.pptx	116246	2026-02-20 17:41:09
EXISTS	out/eps_forecast_comparison_v2.pdf	203074	2026-02-20 17:41:11
EXISTS	out/smokes/templates_v1_light.pptx	246710	2026-02-20 17:43:34
EXISTS	out/smokes/templates_v1_dark.pptx	246710	2026-02-20 17:43:35
EXISTS	out/smokes/chevron_width_stress_light.pptx	64920	2026-02-20 17:43:38
EXISTS	out/smokes/chevron_width_stress_dark.pptx	64919	2026-02-20 17:43:39
EXISTS	out/smokes/card_padding_matrix.pptx	65395	2026-02-20 17:43:43
EXISTS	out/geometry-arrowheads-vertical.pptx	62586	2026-02-20 17:43:59
EXISTS	out/geometry-arrowheads-diagonal.pptx	58827	2026-02-20 17:44:03
```
- Commands associated with listed artifacts:
  - npm run render -- examples/demos/eps_forecast_comparison.json out/eps_forecast_comparison_v2.pptx
  - npm run smoke:templates-v1
  - npm run smoke:chevron-width-stress
  - npm run smoke:card-padding-matrix
  - npm run smoke:geometry-arrowheads-vertical
  - npm run smoke:geometry-arrowheads-diagonal
## 9) Open Questions / Ambiguities (Short)
- computeLineWithArrowheads threshold path is clearly active for custom-arrowhead geometry, but plain connector native-arrow mode may bypass it; confirm intended policy scope.
- Template compiler constrains structure/slots but not explicit min-font thresholds; confirm whether hardening should add template-level typography invariants or keep renderer-only authority.
- Chevron defaults are split across compiler pass-through and renderer fallback; confirm desired single source for orientation/layout profile defaults before patching.

Cleanup note: temporary capture outputs (out/smokes/bullets_alignment_capture.*, out/smokes/list_v1_capture.*, out/smokes/card_v1_capture.*) were used only for evidence capture and should be removed after artifact harvest; screenshot evidence remains under docs/assets/hardening/.
