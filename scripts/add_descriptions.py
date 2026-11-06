import argparse
import json
from pathlib import Path


def get_description(record):
    descriptions = (
        record.get("containers", {})
        .get("cna", {})
        .get("descriptions", [])
    )

    # Prefer English; fall back to the first available description.
    description = next(
        (item for item in descriptions if item.get("lang") == "en"),
        descriptions[0] if descriptions else None,
    )

    return description.get("value", "") if description else ""


def main():
    parser = argparse.ArgumentParser(
        description="Add descriptions from CVE record files to grouped CVE JSON."
    )
    parser.add_argument("grouped_json", help="Path to the grouped CVE JSON")
    parser.add_argument("cve_directory", help="Root directory containing year folders")
    parser.add_argument("-o", "--output", default="cves_with_descriptions.json")
    args = parser.parse_args()

    # Index files such as cves/2025/12xxx/CVE-2025-12004.json by CVE ID.
    cve_files = {
        path.stem: path
        for path in Path(args.cve_directory).rglob("CVE-*.json")
    }

    grouped = json.loads(Path(args.grouped_json).read_text(encoding="utf-8"))

    matched = 0
    missing_files = 0

    for severity_data in grouped.values():
        for cve_list in severity_data.get("vendors", {}).values():
            for cve in cve_list:
                cve_id = cve.get("CVE ID", "")
                cve_path = cve_files.get(cve_id)

                if cve_path is None:
                    cve["Description"] = "N/A"
                    missing_files += 1
                    continue

                record = json.loads(cve_path.read_text(encoding="utf-8"))
                cve["Description"] = get_description(record) or "N/A"
                matched += 1

    Path(args.output).write_text(
        json.dumps(grouped, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"Descriptions added: {matched}")
    print(f"CVE files not found: {missing_files}")
    print(f"Output written to: {args.output}")


if __name__ == "__main__":
    main()
