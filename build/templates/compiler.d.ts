import type { ConcreteTheme } from "../theme/types.js";
import type { SlideProgramSpec } from "../render/types.js";
export declare function compileTemplateSpec(args: {
    spec: unknown;
    theme: ConcreteTheme;
    strict: boolean;
}): {
    spec: SlideProgramSpec | null;
    errors: string[];
};
//# sourceMappingURL=compiler.d.ts.map