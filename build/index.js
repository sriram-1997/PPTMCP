import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
// Import business tools
import { pptCreator, pptEditor, pptEditorEnhanced } from "./tools/ppt-creator.js";
import { pptEditorAdvanced } from "./tools/ppt-editor-advanced.js";
import { pptReader, pptAnalyzer } from "./tools/ppt-reader.js";
import { pptRenderer } from "./tools/render-pptmcp.js";
// Create MCP server
const server = new Server({
    name: "PPT-MCP",
    version: "1.0.0",
}, {
    capabilities: { tools: {} }
});
// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: pptCreator.name,
                description: pptCreator.description,
                inputSchema: pptCreator.parameters
            },
            {
                name: pptEditor.name,
                description: pptEditor.description,
                inputSchema: pptEditor.parameters
            },
            {
                name: pptReader.name,
                description: pptReader.description,
                inputSchema: pptReader.parameters
            },
            {
                name: pptAnalyzer.name,
                description: pptAnalyzer.description,
                inputSchema: pptAnalyzer.parameters
            },
            {
                name: pptEditorEnhanced.name,
                description: pptEditorEnhanced.description,
                inputSchema: pptEditorEnhanced.parameters
            },
            {
                name: pptEditorAdvanced.name,
                description: pptEditorAdvanced.description,
                inputSchema: pptEditorAdvanced.parameters
            },
            {
                name: pptRenderer.name,
                description: pptRenderer.description,
                inputSchema: pptRenderer.parameters
            }
        ]
    };
});
// Tool call handling
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "create_presentation":
            return await pptCreator.run(request.params.arguments || {});
        case "edit_presentation":
            return await pptEditor.run(request.params.arguments || {});
        case "read_presentation":
            return await pptReader.run(request.params.arguments || {});
        case "analyze_presentation":
            return await pptAnalyzer.run(request.params.arguments || {});
        case "edit_presentation_enhanced":
            return await pptEditorEnhanced.run(request.params.arguments || {});
        case "edit_presentation_advanced":
            return await pptEditorAdvanced.run(request.params.arguments || {});
        case "render_pptmcp":
            return await pptRenderer.run(request.params.arguments || {});
        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("PPT-MCP server started successfully");
}
main().catch((error) => {
    console.error("Failed to start PPT-MCP server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map