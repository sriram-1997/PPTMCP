# 🎯 PPT-MCP

> **Pure Node.js PowerPoint MCP Server** - Create, analyze, and manage PowerPoint presentations with AI assistance

<mcreference link="https://www.npmjs.com/package/pptxgenjs" index="1">1</mcreference> **PPT-MCP** is a Model Context Protocol (MCP) server that provides comprehensive PowerPoint presentation management capabilities using pure JavaScript/TypeScript. Built with **PptxGenJS**, the most popular PowerPoint library for Node.js with 3,500+ GitHub stars.

## ✨ Features

### 🚀 **Pure Node.js Stack**
- **Zero Python Dependencies** - 100% JavaScript/TypeScript implementation
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Modern Architecture** - Built with latest Node.js and TypeScript
- **Lightweight** - Minimal dependencies, fast startup

### 📊 **Core Capabilities**
- **🎨 Create Presentations** - Generate professional PowerPoint files with custom templates
- **✏️ Edit Existing Files** - Advanced editing capabilities with pptx-automizer for real PowerPoint modification
- **📖 File Analysis** - Analyze presentation structure and metadata
- **🔧 Template Support** - Basic, Professional, and Modern design templates
- **📁 File Management** - Smart file handling and directory management

### 🎯 **AI-Powered Workflow**
- **Claude Integration** - Seamless integration with Claude Desktop
- **Natural Language** - Create presentations using conversational commands
- **Intelligent Templates** - AI-suggested layouts and designs
- **Batch Operations** - Handle multiple presentations efficiently

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Claude Desktop** (for MCP integration)

### Installation

#### Option 1: NPM Package (Recommended)
```bash
npm install -g ppt-mcp
```

#### Option 2: From Source
```bash
git clone https://github.com/guangxiangdebizi/PPT-MCP.git
cd PPT-MCP
npm install
npm run build
```

### Claude Desktop Configuration

Add to your Claude Desktop config:

#### Stdio Mode (Local Development)
```json
{
  "mcpServers": {
    "ppt-mcp": {
      "command": "node",
      "args": ["path/to/PPT-MCP/build/index.js"]
    }
  }
}
```

#### SSE Mode (Production)
```bash
# Install and run with Supergateway
npm install -g supergateway
npx supergateway --stdio "node build/index.js" --port 3100
```

```json
{
  "mcpServers": {
    "ppt-mcp": {
      "type": "sse",
      "url": "http://localhost:3100/sse",
      "timeout": 600
    }
  }
}
```

## 🛠️ Available Tools

### 1. **create_presentation**
Create new PowerPoint presentations with customizable options.

**Parameters:**
- `title` (required) - Presentation title
- `slides` (optional) - Number of slides (default: 1)
- `output_path` (optional) - Custom save location
- `template` (optional) - Design template: `basic`, `professional`, `modern`

**Example:**
```
Create a presentation titled "Q4 Business Review" with 5 slides using the professional template
```

### 2. **edit_presentation**
Basic editing of existing presentations (Note: Limited by PptxGenJS library capabilities).

**Parameters:**
- `file_path` (required) - Path to existing presentation
- `operation` (required) - Edit type: `add_slide`, `add_text`, `add_image`, `add_table`
- `slide_index` (optional) - Target slide number
- `content` (optional) - Content to add

### 2.5. **edit_presentation_enhanced** 🆕
Enhanced PowerPoint editing with comprehensive guidance and step-by-step instructions for manual editing.

**Parameters:**
- `file_path` (required) - Path to existing presentation
- `operation` (required) - Operation type: `get_guidance`, `add_slide`, `replace_text`, `extract_content`
- `slide_index` (optional) - Target slide number (1-based)
- `content` (optional) - Content specifications

**Features:**
- 📋 Step-by-step editing instructions
- 🔧 Multiple solution approaches
- 💡 Best practice recommendations
- 🎯 Operation-specific guidance

**Example:**
```
Get guidance for editing "report.pptx" to replace text content
```

### 3. **read_presentation**
Analyze and extract information from PowerPoint files.

**Parameters:**
- `file_path` (required) - Path to presentation file
- `output_format` (optional) - Format: `text`, `json`, `markdown`
- `slide_range` (optional) - Specific slides to read
- `include_notes` (optional) - Include speaker notes

### 4. **analyze_presentation**
Perform comprehensive analysis of presentation structure and content.

**Parameters:**
- `file_path` (required) - Path to presentation file
- `analysis_type` (optional) - Analysis type: `structure`, `content`, `statistics`, `readability`, `comprehensive`
- `detailed` (optional) - Enable detailed analysis

## 📁 Project Structure

```
PPT-MCP/
├── src/
│   ├── index.ts              # MCP server entry point
│   └── tools/
│       ├── ppt-creator.ts     # Creation & editing tools
│       └── ppt-reader.ts      # Reading & analysis tools
├── build/                     # Compiled JavaScript
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Documentation
└── LICENSE                   # Apache 2.0 License
```

## 🔧 Development

### Build Commands
```bash
npm run build        # Compile TypeScript
npm run dev          # Watch mode compilation
npm start           # Run compiled server
npm run sse         # Start with Supergateway SSE
```

### Testing
```bash
# Test server startup
node build/index.js

# Test presentation creation
# (Use Claude Desktop or MCP client)
```

## 🎨 Template Showcase

### **Basic Template**
- Clean, minimal design
- Black text on white background
- Perfect for academic or simple business presentations

### **Professional Template**
- Corporate color scheme (Dark Slate Gray)
- Sophisticated typography
- Ideal for business meetings and reports

### **Modern Template**
- Vibrant blue and green accents
- Contemporary design elements
- Great for creative and tech presentations

## 🚀 Technology Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **PPT Engine:** <mcreference link="https://www.npmjs.com/package/pptxgenjs" index="1">1</mcreference> PptxGenJS (3,500+ ⭐)
- **MCP SDK:** @modelcontextprotocol/sdk
- **Build System:** TypeScript Compiler
- **Package Manager:** NPM

## 🔄 Migration from Python

This version represents a complete rewrite from Python to pure Node.js:

### **Advantages of Node.js Version:**
- ✅ **Faster Startup** - No Python interpreter overhead
- ✅ **Simpler Deployment** - Single runtime environment
- ✅ **Better Integration** - Native JavaScript ecosystem
- ✅ **Modern Tooling** - TypeScript, ESM, and modern Node.js features
- ✅ **Cross-Platform** - Consistent behavior across operating systems

### **Current Limitations:**
- ⚠️ **Direct File Modification** - PptxGenJS is creation-focused, not editing-focused
- ⚠️ **Complex Animations** - Advanced animations not yet supported
- ⚠️ **Embedded Media** - Video/audio embedding requires additional implementation

### **Solutions Provided:**
- ✅ **Comprehensive Guidance** - `edit_presentation_enhanced` tool provides step-by-step instructions
- ✅ **Multiple Approaches** - Manual editing, hybrid workflows, and programmatic creation
- ✅ **Best Practices** - Detailed recommendations for different editing scenarios

*The `edit_presentation_enhanced` tool bridges the gap by providing expert guidance for PowerPoint editing workflows.*

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure cross-platform compatibility

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Xingyu Chen**
- 🌐 **LinkedIn:** [Xingyu Chen](https://www.linkedin.com/in/xingyu-chen-b5b3b0313/)
- 📧 **Email:** guangxiangdebizi@gmail.com
- 🐙 **GitHub:** [@guangxiangdebizi](https://github.com/guangxiangdebizi/)
- 📦 **NPM:** [@xingyuchen](https://www.npmjs.com/~xingyuchen)

## 🙏 Acknowledgments

- **PptxGenJS Team** - For the excellent PowerPoint generation library
- **Anthropic** - For the Model Context Protocol specification
- **TypeScript Team** - For the amazing type system
- **Node.js Community** - For the robust runtime environment

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

[🐛 Report Bug](https://github.com/guangxiangdebizi/PPT-MCP/issues) • [✨ Request Feature](https://github.com/guangxiangdebizi/PPT-MCP/issues) • [📖 Documentation](https://github.com/guangxiangdebizi/PPT-MCP)

</div>
## Deterministic Layout (render_pptmcp)
- JSON-driven, grid/region-based layout with strict validation
- Supported elements: text, lists, cards, tables, column charts, line charts, callouts (box + leader), connectors (straight line), images, icons
- Determinism > expressiveness; no absolute positioning in specs

Example: callout (region anchor only)
```json
{
  "type": "callout",
  "region": "canvas",
  "z": 120,
  "anchor": { "type": "region", "targetRegion": "chart", "point": "ne" },
  "box": { "wIn": 2.2, "hIn": 0.8, "placement": "auto", "paddingPt": 6 },
  "text": { "value": "Margin inflects here (+210 bps).", "style": { "fontSize": 12 } },
  "leader": { "style": "line", "endCap": "none" }
}
```

Example: connector (region anchors only)
```json
{
  "type": "connector",
  "region": "canvas",
  "z": 110,
  "start": { "type": "region", "targetRegion": "chart", "point": "e" },
  "end": { "type": "region", "targetRegion": "table", "point": "w" },
  "style": { "widthPt": 1 }
}
```

Example: list (dot bullets)
```json
{
  "type": "list",
  "region": "content",
  "style": "dot",
  "bullet": { "size": "md", "gap": 10, "color": "text" },
  "indent": { "left": 0, "hanging": 18 },
  "lineGap": 6,
  "items": [
    { "text": "**Bold lead** - supporting explanation" }
  ]
}
```

Example: card
```json
{
  "type": "card",
  "region": "content",
  "variant": "surface",
  "style": { "bg": "surface", "border": "default", "radius": "md", "padding": "md", "accent": { "edge": "left", "color": "accent" } },
  "header": { "title": "Key Takeaway", "subtitle": "Optional subtitle", "icon": "target" },
  "body": [
    { "type": "list", "style": "dot", "items": [{ "text": "First point" }] }
  ],
  "footer": { "strip": true, "label": "Key Takeaway", "text": "Concise insight sentence." }
}
```

Example: line chart (v0.1)
```json
{
  "type": "chart",
  "region": "content",
  "chartType": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "series": [
      { "name": "Series A", "values": [10, 15, 12] }
    ]
  },
  "options": { "showGrid": true, "showMarkers": true, "smooth": false, "yAxisZero": true }
}
```

Error codes (render_pptmcp):
- `layer_z_invalid`
- `anchor_type_not_supported`
- `anchor_region_not_found`
- `callout_missing_box_dims`
- `callout_no_feasible_placement`
- `callout_box_outside_region`
- `callout_leader_style_not_supported`
- `callout_leader_endcap_not_supported`
- `connector_outside_region`
- `absolute_position_forbidden`

Smoke commands:
- `npm run smoke:list`
- `npm run smoke:card`
- `npm run smoke:line-chart`
- `npm run smoke:list:fail-icon`
- `npm run smoke:card:overflow`
- `npm run smoke:chart:mismatch`
## Theme / Style Tokens v0

Theme is a pure style layer (colors/fonts only). Geometry and layout are unchanged.

Example:
```json
{
  "theme": "consulting_light_v1",
  "styleTokens": {
    "color.accent": "#10B981",
    "chart.palette": ["#10B981", "#F97316"]
  }
}
```

Token keys (v0):
- `color.background`
- `color.surface`
- `color.text_primary`
- `color.text_secondary`
- `color.border_default`
- `color.primary`
- `color.accent`
- `chart.palette`
- `type.font_family_primary`
- `type.font_family_secondary`
- `type.body_size`
- `type.small_size`
- `type.weight_medium`
- `type.weight_bold`
- `shape.border_width_default`

Rules:
- Unknown token keys hard-fail with `unknown_style_token`.
- Invalid token values hard-fail with `style_token_invalid`.
- Missing theme file hard-fails with `theme_not_found`.
- Chart text/legend uses `color.text_primary`. Axis/gridlines use `color.border_default`. Chart/plot area fill uses `color.background`.

Verification (manual):
- Render `examples/themes/theme_default.json` and `examples/themes/theme_dark.json`.
- Compare slide background and chart series colors by unzipping the PPTX (`ppt/slides/slide1.xml`, `ppt/charts/chart1.xml`) or via the `--unzip-out` helper.

## Geometry v1
- Post-layout geometry resolution for connectors and callout leaders.
- Arrowheads are sized from stroke width and lines are trimmed to arrow bases.
- No negative extents, deterministic rounding (see `docs/geometry_v1.md`).

## Theme / Style Tokens v2
Theme v2 introduces font, space, and stroke scales (see `docs/theme_v2.md`).
Unknown tokens hard-fail; no cascade or inheritance beyond single-level overrides.

## Templates v1
Templates v1 compile deterministically into standard grid/region slides (see `docs/templates_v1.md`).

Example (template slide):
```json
{
  "id": "slide-1",
  "title": "Template Slide",
  "template": "title_slide",
  "fills": {
    "title": { "content": "Templates v1" },
    "subtitle": { "content": "Compiled to regions" }
  }
}
```

## System Discipline
- Canonical slot paths enforced via SlotMap (`text.*`, `surface.*`, `stroke.*`).
- Global contrast validation at theme load with bounded thresholds.
- Template layout modes (`single`, `vstack`, `hstack`, `grid`) with strict item schemas.
- EMU quantization enforced for template rects (no silent snapping).
- See `docs/system_discipline.md` for the full policy.

## Verified Capabilities (render_pptmcp)
- Deterministic, grid/region-based layout (no absolute positioning in specs).
- Elements: text, lists v1, cards v1, tables (no merges), column charts v0 (1-2 series), line charts v0.1, callouts v0 (box + leader), connectors, images, icons.
- Theme v2 tokens for colors, typography scale, spacing scale, and stroke scale.
- Theme contrast validation with bounded thresholds.
- Geometry v1: arrowheaded connectors/leaders with no negative extents.
- Templates v1: template definitions + inheritance compile into regions/elements (no behavior changes).

## Known Limitations (hard-fail)
- Unsupported chart types (only column v0 and line v0.1 supported).
- Merged table cells (`rowSpan`/`colSpan`).
- Non-region anchors or absolute positioning.
- Advanced shapes, animations, videos.
- Template rects must be EMU-quantized (use `npm run templates:format`).

## Roadmap (Explicit, Not Yet Implemented)
- chart_point anchors (plot/legend/data point).
- element_point anchors for generic shapes/text boxes.
- routed/elbow connectors with deterministic routing.
- overlap avoidance for callouts.
