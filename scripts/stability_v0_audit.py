import json
import os
import sys
from typing import Any, Dict, List, Set, Tuple

SPEC_PATH = "examples/demos/pptmcp_capabilities_deck_v1.json"
OUT_PATH = "out/demos/pptmcp_capabilities_deck_v1.audit.json"
ICON_REGISTRY = "src/assets/iconRegistry.json"
IMAGE_PATH = "examples/assets/pptmcp_mark.png"

GEOMETRY_KEYS = {"x", "y", "w", "h"}
BULLET_STYLES = {"dot", "number", "icon", "none"}


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def find_geometry_keys(obj: Any, path: str = "") -> List[str]:
    hits = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            next_path = f"{path}/{k}" if path else f"/{k}"
            if k in GEOMETRY_KEYS:
                hits.append(next_path)
            hits.extend(find_geometry_keys(v, next_path))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            next_path = f"{path}[{i}]"
            hits.extend(find_geometry_keys(v, next_path))
    return hits


def collect_icons(obj: Any, icons: Set[str]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "icon" and isinstance(v, str):
                icons.add(v)
            else:
                collect_icons(v, icons)
    elif isinstance(obj, list):
        for v in obj:
            collect_icons(v, icons)


def collect_list_styles(obj: Any, styles: Set[str]) -> None:
    if isinstance(obj, dict):
        if obj.get("type") == "list" or obj.get("kind") == "list":
            style = obj.get("style")
            if isinstance(style, str):
                styles.add(style)
        for v in obj.values():
            collect_list_styles(v, styles)
    elif isinstance(obj, list):
        for v in obj:
            collect_list_styles(v, styles)


def find_nested_card_in_body(card_obj: Dict[str, Any], slide_index: int, findings: List[str]) -> None:
    body = card_obj.get("body")
    if not isinstance(body, list):
        return
    for idx, item in enumerate(body):
        if isinstance(item, dict):
            if item.get("type") == "card" or item.get("kind") == "card":
                findings.append(f"Slide {slide_index}: card body contains nested card at index {idx}")


def scan_for_nested_cards(obj: Any, slide_index: int, findings: List[str]) -> None:
    if isinstance(obj, dict):
        if obj.get("type") == "card" or obj.get("kind") == "card":
            find_nested_card_in_body(obj, slide_index, findings)
        for v in obj.values():
            scan_for_nested_cards(v, slide_index, findings)
    elif isinstance(obj, list):
        for v in obj:
            scan_for_nested_cards(v, slide_index, findings)


def slide_has_node_edge(slide: Dict[str, Any]) -> Tuple[bool, bool]:
    has_node = False
    has_edge = False
    for el in slide.get("elements", []):
        if isinstance(el, dict):
            if el.get("type") == "node":
                has_node = True
            if el.get("type") == "edge":
                has_edge = True
    return has_node, has_edge


def slide_has_overlays(slide: Dict[str, Any]) -> bool:
    for el in slide.get("elements", []):
        if isinstance(el, dict) and el.get("type") == "chart":
            overlays = el.get("overlays")
            if isinstance(overlays, dict):
                if overlays.get("averageLine") is True and overlays.get("trendLine") is True:
                    return True
    return False


def main() -> int:
    errors: List[str] = []
    audit: Dict[str, Any] = {
        "spec_path": SPEC_PATH,
        "checks": {},
    }

    try:
        spec = load_json(SPEC_PATH)
    except Exception as e:
        errors.append(f"Failed to load spec: {e}")
        write_json(OUT_PATH, {"errors": errors})
        return 1

    slides = spec.get("slides")
    if not isinstance(slides, list):
        errors.append("Spec missing slides array")
        write_json(OUT_PATH, {"errors": errors})
        return 1

    # A) Structural assertions
    audit["checks"]["slide_count"] = len(slides)
    if len(slides) != 9:
        errors.append(f"Slide count must be 9, found {len(slides)}")

    geometry_hits: List[str] = []
    per_slide_bullets: Dict[str, List[str]] = {}
    all_styles: Set[str] = set()

    for i, slide in enumerate(slides, start=1):
        if not isinstance(slide, dict):
            errors.append(f"Slide {i} is not an object")
            continue
        has_template = "template" in slide
        if not has_template:
            regions = slide.get("regions")
            if not isinstance(regions, dict):
                errors.append(f"Slide {i} missing regions")
        # geometry scan in elements only
        for elem_index, el in enumerate(slide.get("elements", []), start=1):
            if isinstance(el, dict):
                hits = find_geometry_keys(el)
                if hits:
                    geometry_hits.extend([f"Slide {i} element {elem_index}: {h}" for h in hits])

        # bullet styles per slide
        styles: Set[str] = set()
        collect_list_styles(slide, styles)
        # only report styles we care about
        used = sorted([s for s in styles if s in BULLET_STYLES])
        per_slide_bullets[str(i)] = used
        all_styles.update(used)

    if geometry_hits:
        errors.append("Geometry keys found in elements: " + "; ".join(geometry_hits))

    audit["bullet_styles_per_slide"] = per_slide_bullets
    audit["bullet_styles_overall"] = sorted(list(all_styles))

    # C) Nested card rule
    nested_card_findings: List[str] = []
    for i, slide in enumerate(slides, start=1):
        scan_for_nested_cards(slide, i, nested_card_findings)
    if nested_card_findings:
        errors.extend(nested_card_findings)
    audit["nested_card_findings"] = nested_card_findings

    # D) Diagram and chart checks
    slide3 = slides[2] if len(slides) >= 3 else None
    if isinstance(slide3, dict):
        has_node, has_edge = slide_has_node_edge(slide3)
        audit["slide3_has_node"] = has_node
        audit["slide3_has_edge"] = has_edge
        if not (has_node and has_edge):
            errors.append("Slide 3 must contain node and edge")
    else:
        errors.append("Slide 3 missing")

    slide5 = slides[4] if len(slides) >= 5 else None
    if isinstance(slide5, dict):
        has_overlays = slide_has_overlays(slide5)
        audit["slide5_has_overlays"] = has_overlays
        if not has_overlays:
            errors.append("Slide 5 must contain chart overlays averageLine + trendLine")
    else:
        errors.append("Slide 5 missing")

    # E) Asset checks
    audit["image_exists"] = os.path.exists(IMAGE_PATH)
    if not audit["image_exists"]:
        errors.append(f"Image not found: {IMAGE_PATH}")

    icons_in_spec: Set[str] = set()
    collect_icons(spec, icons_in_spec)
    audit["icons_referenced"] = sorted(list(icons_in_spec))

    try:
        registry = load_json(ICON_REGISTRY)
        registry_icons = registry.get("icons", {})
        if not isinstance(registry_icons, dict):
            errors.append("Icon registry missing icons map")
            registry_icons = {}
    except Exception as e:
        errors.append(f"Failed to load icon registry: {e}")
        registry_icons = {}

    missing_icons = [icon for icon in sorted(icons_in_spec) if icon not in registry_icons]
    audit["missing_icons"] = missing_icons
    if missing_icons:
        errors.append("Missing icon ids: " + ", ".join(missing_icons))

    audit["errors"] = errors
    write_json(OUT_PATH, audit)

    if errors:
        print("Audit failed")
        for err in errors:
            print("-", err)
        return 1

    print("Audit passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
