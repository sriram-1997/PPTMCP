import json
import os
import sys
from typing import Any, List, Dict

LIGHT = "examples/demos/pptmcp_capabilities_deck_v1.json"
DARK = "examples/demos/pptmcp_capabilities_deck_v1_dark.json"
OUT = "out/demos/pptmcp_capabilities_deck_v1.spec_diff.json"


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def diff(a: Any, b: Any, path: str = "") -> List[Dict[str, Any]]:
    diffs: List[Dict[str, Any]] = []
    if type(a) != type(b):
        diffs.append({"path": path or "/", "a": a, "b": b})
        return diffs
    if isinstance(a, dict):
        keys = set(a.keys()) | set(b.keys())
        for k in sorted(keys):
            p = f"{path}/{k}" if path else f"/{k}"
            if k not in a:
                diffs.append({"path": p, "a": None, "b": b.get(k)})
            elif k not in b:
                diffs.append({"path": p, "a": a.get(k), "b": None})
            else:
                diffs.extend(diff(a[k], b[k], p))
        return diffs
    if isinstance(a, list):
        max_len = max(len(a), len(b))
        for i in range(max_len):
            p = f"{path}[{i}]"
            if i >= len(a):
                diffs.append({"path": p, "a": None, "b": b[i]})
            elif i >= len(b):
                diffs.append({"path": p, "a": a[i], "b": None})
            else:
                diffs.extend(diff(a[i], b[i], p))
        return diffs
    if a != b:
        diffs.append({"path": path or "/", "a": a, "b": b})
    return diffs


def main() -> int:
    light = load_json(LIGHT)
    # create dark spec from light
    dark = json.loads(json.dumps(light))
    dark["theme"] = "consulting_dark_v1"

    os.makedirs(os.path.dirname(DARK), exist_ok=True)
    with open(DARK, "w", encoding="utf-8") as f:
        json.dump(dark, f, indent=2)
        f.write("\n")

    # compare
    diffs = diff(light, dark)
    allowed = {"/theme"}
    unexpected = [d for d in diffs if d["path"] not in allowed]
    out = {
        "light": LIGHT,
        "dark": DARK,
        "diffs": diffs,
        "unexpected_diffs": unexpected,
        "only_theme_changed": len(unexpected) == 0 and len(diffs) >= 1,
    }
    write_json(OUT, out)

    if unexpected:
        print("Unexpected diffs found:")
        for d in unexpected:
            print(f"- {d['path']}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
