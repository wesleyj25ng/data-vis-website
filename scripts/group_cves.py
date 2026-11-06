import argparse
import json
from collections import defaultdict
from pathlib import Path

SEVERITIES = ("CRITICAL", "HIGH", "MEDIUM", "LOW")


def group_cves(records):
    grouped = {severity: defaultdict(list) for severity in SEVERITIES}

    for index, cve in enumerate(records):
        if not isinstance(cve, dict):
            raise ValueError(f"Record {index} is not a JSON object")

        severity = str(cve.get("CVSS Severity", "")).strip().upper()


        if severity in ("", "N/A", "NONE"):
            continue

        if severity not in grouped:
            raise ValueError(
                f"Record {index} has unsupported CVSS Severity: {severity!r}"
            )

        vendor = str(cve.get("Vendor") or "Unknown").strip()
        if vendor.casefold() == "n/a":
            continue
        
        grouped[severity][vendor].append(cve)

    # Convert defaultdicts to regular dicts for JSON serialization.
    return {
        severity: {
            "count": sum(len(cves) for cves in vendors.values()),
            "vendors": dict(
                sorted(
                    (
                        (vendor, cves)
                        for vendor, cves in vendors.items()
                        if len(cves) >= 10
                    ),
                    key=lambda item: len(item[1]),
                    reverse=True,
                )
            ),
        }
        for severity, vendors in grouped.items()
    }


def main():
    parser = argparse.ArgumentParser(
        description="Group CVE records by severity and vendor."
    )
    parser.add_argument("input", help="Path to the input JSON array")
    parser.add_argument(
        "-o", "--output", default="cves_by_severity.json",
        help="Output path (default: cves_by_severity.json)"
    )
    args = parser.parse_args()

    records = json.loads(Path(args.input).read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise ValueError("The input JSON must be an array of CVE objects")

    grouped = group_cves(records)
    Path(args.output).write_text(
        json.dumps(grouped, separators=(",", ":"), ensure_ascii=False),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
