import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
TOP_N = 10
CWE_NAMES = {
    "CWE-20": "Improper Input Validation",
    "CWE-22": "Path Traversal",
    "CWE-79": "Cross-site Scripting",
    "CWE-89": "SQL Injection",
    "CWE-125": "Out-of-bounds Read",
    "CWE-284": "Improper Access Control",
    "CWE-352": "Cross-Site Request Forgery",
    "CWE-416": "Use After Free",
    "CWE-787": "Out-of-bounds Write",
    "CWE-862": "Missing Authorization",
}


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/build-cwe-severity-data.py INPUT.csv OUTPUT.json")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    totals = Counter()
    cells = defaultdict(Counter)
    published = 0
    with_cwe = 0

    with input_path.open(newline="", encoding="utf-8-sig") as source:
        reader = csv.DictReader(source)
        required = {"State", "CVSS Severity", "CVE Problem Types"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing required CSV columns: {', '.join(sorted(missing))}")

        for row in reader:
            if row["State"].strip().upper() != "PUBLISHED":
                continue
            published += 1
            ids = re.findall(r"\bCWE-\d+\b", row["CVE Problem Types"])
            if not ids:
                continue
            # CVEs with several CWEs are counted once, under the first one listed.
            cwe = ids[0]
            with_cwe += 1
            totals[cwe] += 1
            severity = row["CVSS Severity"].strip().upper()
            if severity in SEVERITIES:
                cells[cwe][severity] += 1

    top = [cwe for cwe, _ in totals.most_common(TOP_N)]
    plotted = sum(sum(cells[cwe].values()) for cwe in top)
    result = {
        "severities": SEVERITIES,
        "publishedRecords": published,
        "recordsWithCwe": with_cwe,
        "plottedRecords": plotted,
        "cwes": [
            {
                "cwe": cwe,
                "name": CWE_NAMES.get(cwe, ""),
                "total": totals[cwe],
                "counts": {severity: cells[cwe][severity] for severity in SEVERITIES},
            }
            for cwe in top
        ],
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as output:
        json.dump(result, output, indent=2)
        output.write("\n")
    print(f"Wrote {len(top)} CWEs ({plotted:,} scored records) to {output_path}")


if __name__ == "__main__":
    main()
