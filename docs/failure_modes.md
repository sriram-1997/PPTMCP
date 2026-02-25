# Failure Modes

## 1) LLM Invalid JSON
Description: Model output can contain malformed JSON, trailing commas, comments, or schema-incompatible structures.
Detection mechanism: JSON parse failures (`Failed to parse spec JSON`) and schema validation failures from `validateSpec`/template compiler.
Mitigation strategy: Reject on parse/validation, return actionable error strings, and require regeneration with strict JSON output.

## 2) Overflow Content Density
Description: Text/table payload can exceed region capacity, causing shrink/truncate decisions or unresolved overflow.
Detection mechanism: Layout estimation in text/table preparation plus `validation_report` overflow entries.
Mitigation strategy: In enterprise mode, truncation is disallowed and overflow must hard-fail; operators reduce content density or increase region span.

## 3) Theme Token Conflict
Description: Unknown or invalid style token overrides can break visual consistency or violate contrast constraints.
Detection mechanism: Token normalization in `resolveConcreteTheme` (`unknown_style_token`, `style_token_invalid`, contrast checks).
Mitigation strategy: Use pinned theme IDs, validated overrides only, and treat token errors as hard failures.

## 4) Geometry Constraint Violation
Description: Region definitions or anchor placements can violate slide bounds or connector/callout constraints.
Detection mechanism: Grid/region validation, anchor validation, and geometry integrity checks during preparation.
Mitigation strategy: Keep regions grid-valid, use region-only anchors, and fail fast on out-of-bounds geometry.

## 5) Diagram Directional Misalignment
Description: Node/edge/callout connector direction can be semantically reversed or visually misleading.
Detection mechanism: Existing directional integrity checks, edge/node validation, and smoke assertions in diagram-focused specs.
Mitigation strategy: Preserve start/end semantics, keep canonical line normalization, and run diagram smokes before pilot promotion.

## 6) Determinism Mismatch
Description: Two renders of the same input can diverge if nondeterministic ordering or mutation enters the path.
Detection mechanism: SHA-256 hash comparison across two successive renders of the same spec.
Mitigation strategy: Enterprise mode enforces determinism check and fails on hash mismatch (`enterprise_determinism_mismatch`).
