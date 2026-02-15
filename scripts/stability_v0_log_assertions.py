import json
import os
import sys

LOGS = [
    "out/demos/pptmcp_capabilities_deck_v1.renderlog.txt",
    "out/demos/pptmcp_capabilities_deck_v1_dark.renderlog.txt",
    "out/demos/pptmcp_capabilities_deck_v1.pdf.renderlog.txt",
]
OUT = "out/demos/pptmcp_capabilities_deck_v1.log_assertions.json"

TOKENS = [
    "overflow",
    "arrowhead_scaled",
    "missing_asset",
    "silent_drop",
    "dropped",
    "nan",
    "geometry_violation",
]


def main() -> int:
    results = {}
    failed = False
    for path in LOGS:
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
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
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
