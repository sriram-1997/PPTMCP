import json
import os
import sys

DEFAULT_LOGS = [
    "out/demos/pptmcp_capabilities_deck_v1.renderlog.txt",
    "out/demos/pptmcp_capabilities_deck_v1_dark.renderlog.txt",
    "out/demos/pptmcp_capabilities_deck_v1.pdf.renderlog.txt",
]
DEFAULT_OUT = "out/demos/pptmcp_capabilities_deck_v1.log_assertions.json"

TOKENS = [
    "overflow",
    "missing_asset",
    "silent_drop",
    "dropped",
    "nan",
    "geometry_violation",
]


def main() -> int:
    args = sys.argv[1:]
    if args:
        if len(args) < 2:
            print("Usage: python scripts/stability_v0_log_assertions.py <out_json> <log1> [log2 ...]")
            return 1
        out_path = args[0]
        logs = args[1:]
    else:
        out_path = DEFAULT_OUT
        logs = DEFAULT_LOGS

    results = {}
    failed = False
    for path in logs:
        entry = {"path": path, "found": []}
        if not os.path.exists(path):
            entry["error"] = "log_missing"
            failed = True
            results[path] = entry
            continue
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.read().splitlines()
        filtered = []
        for line in lines:
            if line.strip().lower().startswith("allow overflow:"):
                continue
            filtered.append(line)
        content = "\n".join(filtered).lower()
        for token in TOKENS:
            if token in content:
                entry["found"].append(token)
        if entry["found"]:
            failed = True
        results[path] = entry

    out = {
        "tokens": TOKENS,
        "results": results,
        "ok": not failed,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
        f.write("\n")

    if failed:
        print("Log assertions failed")
        for path, entry in results.items():
            if entry.get("found"):
                print(f"- {path}: {', '.join(entry['found'])}")
            if entry.get("error"):
                print(f"- {path}: {entry['error']}")
        return 1
    print("Log assertions passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
