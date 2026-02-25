import json
import os
import re
import sys
import zipfile
import statistics
import xml.etree.ElementTree as ET
from typing import Dict, List

DEFAULT_LIGHT = "out/demos/pptmcp_capabilities_deck_v1.pptx"
DEFAULT_DARK = "out/demos/pptmcp_capabilities_deck_v1_dark.pptx"
DEFAULT_OUT_LIGHT = "out/demos/pptmcp_capabilities_deck_v1.shape_counts.json"
DEFAULT_OUT_DARK = "out/demos/pptmcp_capabilities_deck_v1_dark.shape_counts.json"

TAGS = {"sp", "pic", "graphicFrame", "cxnSp", "grpSp"}


def local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def count_shapes_in_slide(xml_bytes: bytes) -> Dict[str, int]:
    root = ET.fromstring(xml_bytes)
    # find spTree
    sp_tree = None
    for elem in root.iter():
        if local_name(elem.tag) == "spTree":
            sp_tree = elem
            break
    if sp_tree is None:
        return {"sp": 0, "pic": 0, "graphicFrame": 0, "cxnSp": 0, "grpSp": 0}
    counts = {"sp": 0, "pic": 0, "graphicFrame": 0, "cxnSp": 0, "grpSp": 0}
    for child in list(sp_tree):
        name = local_name(child.tag)
        if name in TAGS:
            counts[name] += 1
    return counts


def parse_pptx(path: str) -> Dict[str, Dict[str, int]]:
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    slide_map: Dict[int, Dict[str, int]] = {}
    with zipfile.ZipFile(path, "r") as zf:
        slide_files = [n for n in zf.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
        def slide_num(name: str) -> int:
            m = re.search(r"slide(\d+)\.xml$", name)
            return int(m.group(1)) if m else 0
        slide_files.sort(key=slide_num)
        for name in slide_files:
            num = slide_num(name)
            xml_bytes = zf.read(name)
            counts = count_shapes_in_slide(xml_bytes)
            slide_map[num] = counts
    return slide_map


def build_report(path: str, out_path: str) -> None:
    slide_counts = parse_pptx(path)
    slides: List[Dict[str, object]] = []
    totals: List[int] = []
    for slide_num in sorted(slide_counts.keys()):
        counts = slide_counts[slide_num]
        total = sum(counts.values())
        totals.append(total)
        slides.append({
            "slide": slide_num,
            "shape_count": total,
            "by_type": counts,
        })
    median = statistics.median(totals) if totals else 0
    for slide in slides:
        total = slide["shape_count"]
        slide["possible_dropout"] = total < 12 or (median > 0 and total < 0.5 * median)
    report = {
        "pptx": path,
        "median_shape_count": median,
        "slides": slides,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        f.write("\n")


def main() -> int:
    try:
        args = sys.argv[1:]
        if args:
            if len(args) % 2 != 0:
                print(
                    "Usage: python scripts/stability_v0_shape_counts.py <pptx> <out_json> [pptx out_json ...]"
                )
                return 1
            pairs = list(zip(args[0::2], args[1::2]))
        else:
            pairs = [
                (DEFAULT_LIGHT, DEFAULT_OUT_LIGHT),
                (DEFAULT_DARK, DEFAULT_OUT_DARK),
            ]
        for pptx, out_path in pairs:
            build_report(pptx, out_path)
    except Exception as e:
        print(f"Shape count failed: {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
