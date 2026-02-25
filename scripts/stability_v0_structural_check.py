import json
import os
import sys
import zipfile
import xml.etree.ElementTree as ET

DEFAULT_LIGHT = "out/demos/pptmcp_capabilities_deck_v1.pptx"
DEFAULT_DARK = "out/demos/pptmcp_capabilities_deck_v1_dark.pptx"
DEFAULT_OUT = "out/demos/pptmcp_capabilities_deck_v1.structural_check.json"


def check_pptx(path: str) -> dict:
    result = {
        "pptx": path,
        "zip_open": False,
        "presentation_xml": False,
        "rels_present": False,
        "slide_xml_parse_errors": [],
    }
    if not os.path.exists(path):
        result["error"] = "missing_pptx"
        return result

    try:
        with zipfile.ZipFile(path, "r") as zf:
            result["zip_open"] = True
            names = zf.namelist()
            result["presentation_xml"] = "ppt/presentation.xml" in names
            result["rels_present"] = any(name.startswith("_rels/") or name.startswith("ppt/_rels/") for name in names)
            slide_files = [n for n in names if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
            for name in slide_files:
                try:
                    xml_bytes = zf.read(name)
                    ET.fromstring(xml_bytes)
                except Exception as e:
                    result["slide_xml_parse_errors"].append({"slide": name, "error": str(e)})
    except Exception as e:
        result["error"] = str(e)
    return result


def main() -> int:
    args = sys.argv[1:]
    if args:
        if len(args) < 2:
            print("Usage: python scripts/stability_v0_structural_check.py <out_json> <pptx1> [pptx2 ...]")
            return 1
        out_path = args[0]
        pptx_list = args[1:]
        out = {"checks": [check_pptx(p) for p in pptx_list]}
    else:
        out_path = DEFAULT_OUT
        out = {
            "light": check_pptx(DEFAULT_LIGHT),
            "dark": check_pptx(DEFAULT_DARK),
        }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
        f.write("\n")

    ok = True
    if "checks" in out:
        for entry in out["checks"]:
            if (
                not entry.get("zip_open")
                or not entry.get("presentation_xml")
                or not entry.get("rels_present")
                or entry.get("slide_xml_parse_errors")
            ):
                ok = False
    else:
        for key in ("light", "dark"):
            r = out[key]
            if (
                not r.get("zip_open")
                or not r.get("presentation_xml")
                or not r.get("rels_present")
                or r.get("slide_xml_parse_errors")
            ):
                ok = False
    if not ok:
        print("Structural check failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
