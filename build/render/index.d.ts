import type { RenderResult } from "./types.js";
declare function renderPptmcp(args: {
    spec_path: string;
    output_path: string;
    template?: string;
    strict?: boolean;
    allow_overflow?: boolean;
    allow_dense_charts?: boolean;
    export_pdf?: boolean;
    debug_integrity?: boolean;
}): Promise<RenderResult>;
export declare const pptRenderer: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            spec_path: {
                type: string;
                description: string;
            };
            output_path: {
                type: string;
                description: string;
            };
            template: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            strict: {
                type: string;
                description: string;
                default: boolean;
            };
            allow_overflow: {
                type: string;
                description: string;
                default: boolean;
            };
            allow_dense_charts: {
                type: string;
                description: string;
                default: boolean;
            };
            export_pdf: {
                type: string;
                description: string;
                default: boolean;
            };
            debug_integrity: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
    run(args: {
        spec_path: string;
        output_path: string;
        template?: string;
        strict?: boolean;
        allow_overflow?: boolean;
        allow_dense_charts?: boolean;
        export_pdf?: boolean;
        debug_integrity?: boolean;
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
};
export { renderPptmcp };
//# sourceMappingURL=index.d.ts.map