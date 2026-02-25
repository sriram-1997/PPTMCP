import json
import os
import shutil
import subprocess
import sys

DEFAULT_PPTX = "out/demos/pptmcp_capabilities_deck_v1.pptx"
DEFAULT_OUT = "out/demos/pptmcp_capabilities_deck_v1.repair_check.json"


def find_powerpoint() -> str:
    path = shutil.which("powerpnt")
    if path:
        return path
    # common install paths
    candidates = []
    for base in [os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)")]:
        if not base:
            continue
        candidates.extend([
            os.path.join(base, "Microsoft Office", "root", "Office16", "POWERPNT.EXE"),
            os.path.join(base, "Microsoft Office", "root", "Office15", "POWERPNT.EXE"),
            os.path.join(base, "Microsoft Office", "Office16", "POWERPNT.EXE"),
            os.path.join(base, "Microsoft Office", "Office15", "POWERPNT.EXE"),
        ])
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return ""


def get_version(path: str) -> str:
    try:
        cmd = ["powershell", "-NoProfile", "-Command", f"(Get-Item '{path}').VersionInfo.ProductVersion"]
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL)
        return out.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


def main() -> int:
    args = sys.argv[1:]
    if args:
        if len(args) != 2:
            print("Usage: python scripts/stability_v0_repair_check.py <pptx> <out_json>")
            return 1
        pptx_path = args[0]
        out_path = args[1]
    else:
        pptx_path = DEFAULT_PPTX
        out_path = DEFAULT_OUT

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    result = {
        "pptx": pptx_path,
        "powerpoint_available": False,
        "powerpoint_path": "",
        "powerpoint_version": "",
        "open_attempted": False,
        "open_launched": False,
        "repair_prompt_verified": False,
        "reason": "",
    }

    ppt = find_powerpoint()
    if not ppt:
        result["reason"] = "PowerPoint not available"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
            f.write("\n")
        return 0

    result["powerpoint_available"] = True
    result["powerpoint_path"] = ppt
    result["powerpoint_version"] = get_version(ppt)

    if not os.path.exists(pptx_path):
        result["reason"] = "PPTX missing"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
            f.write("\n")
        return 1

    try:
        result["open_attempted"] = True
        subprocess.Popen([ppt, pptx_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        result["open_launched"] = True
        result["reason"] = "manual confirmation required"
    except Exception as e:
        result["open_launched"] = False
        result["reason"] = f"launch_failed: {e}"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
        f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
