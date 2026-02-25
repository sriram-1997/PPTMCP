import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


def scan_pptx(pptx_path: str):
    pptx = Path(pptx_path)
    if not pptx.exists():
        raise FileNotFoundError(pptx_path)

    matches = []
    with zipfile.ZipFile(pptx, "r") as zf:
        slide_names = [name for name in zf.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml")]
        def slide_key(name: str):
            stem = Path(name).stem
            num = "".join([c for c in stem if c.isdigit()])
            return int(num) if num.isdigit() else 0

        for slide_name in sorted(slide_names, key=slide_key):
            slide_num = slide_key(slide_name)
            xml_bytes = zf.read(slide_name)
            try:
                root = ET.fromstring(xml_bytes)
            except ET.ParseError:
                continue
            for node in root.iter():
                tag = node.tag
                if not tag:
                    continue
                if tag.endswith("}t") or tag == "t":
                    text = node.text or ""
                    if "\\n" in text:
                        snippet = text
                        if len(snippet) > 120:
                            snippet = snippet[:117] + "..."
                        matches.append({"slide": slide_num, "text": text, "snippet": snippet})
    return {
        "pptx": str(pptx),
        "matches": matches,
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/stability_v0_text_scan.py <pptx_path>")
        sys.exit(1)
    pptx_path = sys.argv[1]
    report = scan_pptx(pptx_path)
    print(json.dumps(report))


if __name__ == "__main__":
    main()
