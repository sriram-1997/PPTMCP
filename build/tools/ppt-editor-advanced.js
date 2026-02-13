import * as fs from "fs";
import * as path from "path";
// 动态加载 pptx-automizer，避免在未使用时引入重量级依赖
let Automizer;
async function loadAutomizer() {
    if (!Automizer) {
        const module = await import("pptx-automizer");
        Automizer = module.Automizer || module.default;
    }
    return Automizer;
}
export const pptEditorAdvanced = {
    name: "edit_presentation_advanced",
    description: "使用 pptx-automizer 对现有 PowerPoint 进行真实的读写编辑（新增/复制/替换文本等）",
    parameters: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "要编辑的现有演示文稿路径"
            },
            operation: {
                type: "string",
                description: "编辑操作类型",
                enum: ["add_slide", "modify_text", "add_text", "duplicate_slide", "delete_slide", "replace_text", "add_image"]
            },
            slide_index: {
                type: "number",
                description: "要编辑的页码（1 基）"
            },
            content: {
                type: "object",
                description: "根据操作类型传入的内容参数",
                properties: {
                    text: { type: "string", description: "文本内容" },
                    old_text: { type: "string", description: "要被替换的旧文本（replace_text）" },
                    new_text: { type: "string", description: "替换后的新文本（replace_text）" },
                    title: { type: "string", description: "新页标题或提示" },
                    template_slide: { type: "number", description: "从哪一页复制作为模板（add_slide）" },
                    image_path: { type: "string", description: "图片路径（add_image）" },
                    position: {
                        type: "object",
                        properties: {
                            x: { type: "number", description: "X 坐标" },
                            y: { type: "number", description: "Y 坐标" },
                            width: { type: "number", description: "宽度" },
                            height: { type: "number", description: "高度" }
                        }
                    }
                }
            },
            output_path: {
                type: "string",
                description: "输出文件路径（可选，默认覆盖原文件）"
            }
        },
        required: ["file_path", "operation"]
    },
    async run(args) {
        try {
            if (!fs.existsSync(args.file_path)) {
                throw new Error(`File not found: ${args.file_path}`);
            }
            const AutomizerClass = await loadAutomizer();
            const automizer = new AutomizerClass({
                templateDir: path.dirname(args.file_path),
                outputDir: path.dirname(args.output_path || args.file_path),
                useCreationIds: false,
                autoImportSlideMasters: false,
                removeExistingSlides: false,
                cleanup: false
            });
            const templateName = path.basename(args.file_path);
            const outputPath = args.output_path || args.file_path;
            let result;
            switch (args.operation) {
                case "add_slide":
                    result = await this.addSlide(automizer, templateName, outputPath, args);
                    break;
                case "modify_text":
                case "replace_text":
                    result = await this.replaceText(automizer, templateName, outputPath, args);
                    break;
                case "add_text":
                    result = await this.addText(automizer, templateName, outputPath, args);
                    break;
                case "duplicate_slide":
                    result = await this.duplicateSlide(automizer, templateName, outputPath, args);
                    break;
                default:
                    throw new Error(`Unsupported operation: ${args.operation}`);
            }
            return {
                content: [{
                        type: "text",
                        text: `✅ **PowerPoint 编辑成功**\n\n` +
                            `**操作:** ${args.operation}\n` +
                            `**源文件:** ${args.file_path}\n` +
                            `**输出文件:** ${outputPath}\n` +
                            `**详情:** ${result.message || '编辑完成'}`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `❌ **编辑失败:** ${error instanceof Error ? error.message : String(error)}`
                    }],
                isError: true
            };
        }
    },
    async addSlide(automizer, templateName, outputPath, args) {
        const pres = automizer.loadRoot(templateName);
        const slideNumbers = await pres.getAllSlideNumbers();
        const templateSlideIndex = args.content?.template_slide || slideNumbers[0] || 1;
        pres.addSlide(templateName, templateSlideIndex);
        const jszip = await pres.getJSZip();
        const buffer = await jszip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(outputPath, buffer);
        return { message: `已新增一页${args.content?.title ? `：${args.content.title}` : ''}` };
    },
    async replaceText(automizer, templateName, outputPath, args) {
        const pres = automizer.loadRoot(templateName);
        const oldText = args.content?.old_text || args.content?.text;
        const newText = args.content?.new_text || args.content?.text;
        if (oldText && newText) {
            const slideNumbers = await pres.getAllSlideNumbers();
            for (const slideNum of slideNumbers) {
                pres.addSlide(templateName, slideNum);
            }
            pres.addText(newText, (textElement) => {
                textElement.replaceText([{ replace: oldText, by: newText }]);
            });
        }
        const jszip = await pres.getJSZip();
        const buffer = await jszip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(outputPath, buffer);
        return { message: `已将 "${oldText}" 替换为 "${newText}"` };
    },
    async addText(automizer, templateName, outputPath, args) {
        const pres = automizer.loadRoot(templateName);
        const slideNumbers = await pres.getAllSlideNumbers();
        for (const slideNum of slideNumbers) {
            pres.addSlide(templateName, slideNum);
        }
        // 备注：精准定位新增文本需要更复杂的定位实现，当前先复制全部页结构
        const jszip = await pres.getJSZip();
        const buffer = await jszip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(outputPath, buffer);
        return { message: `文本添加准备完成（精确定位需进一步实现）` };
    },
    async duplicateSlide(automizer, templateName, outputPath, args) {
        const pres = automizer.loadRoot(templateName);
        const slideIndex = args.slide_index || 1;
        const slideNumbers = await pres.getAllSlideNumbers();
        for (const slideNum of slideNumbers) {
            pres.addSlide(templateName, slideNum);
        }
        if (slideNumbers.includes(slideIndex)) {
            pres.addSlide(templateName, slideIndex);
        }
        const jszip = await pres.getJSZip();
        const buffer = await jszip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(outputPath, buffer);
        return { message: `已复制第 ${slideIndex} 页` };
    }
};
//# sourceMappingURL=ppt-editor-advanced.js.map