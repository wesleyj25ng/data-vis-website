"""Data for the CWE heatmap (Caleb's Tableau "CWE Heatmap", rebuilt for the website).

Usage: python scripts/build-cwe-severity-heatmap-data.py INPUT.csv OUTPUT.json

Same rules as the Tableau version, which used cve_data_expand_cwes.csv
(one row per CVE and CWE):
- columns are the 20 CWEs with the most CVE records
- rows are the CVSS severities Critical, High, Medium and Low (unscored records are not shown)
- each cell counts CVE records with that CWE and severity
- a CVE with two CWEs counts under both
"""
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cve_labels import cwe_label  # noqa: E402

TOP_CWES = 20
SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/build-cwe-severity-heatmap-data.py INPUT.csv OUTPUT.json")
    input_path, output_path = Path(sys.argv[1]), Path(sys.argv[2])

    totals = Counter()     # CWE -> CVE records (any severity)
    cells = Counter()      # (CWE, severity) -> CVE records
    source_rows = 0
    records_with_cwe = 0

    with input_path.open(newline="", encoding="utf-8-sig") as source:
        for row in csv.DictReader(source):
            source_rows += 1
            cwes = set(re.findall(r"CWE-\d+", row["CVE Problem Types"]))
            if not cwes:
                continue
            records_with_cwe += 1
            severity = row["CVSS Severity"].strip().upper()
            for cwe in cwes:
                totals[cwe] += 1
                if severity in SEVERITIES:
                    cells[(cwe, severity)] += 1

    top = [cwe for cwe, _ in sorted(totals.items(), key=lambda item: (-item[1], int(item[0][4:])))[:TOP_CWES]]
    # same column order as the Tableau sheet: most Critical records first
    top.sort(key=lambda cwe: (-cells[(cwe, "CRITICAL")], -totals[cwe]))

    result = {
        "sourceRows": source_rows,
        "recordsWithCwe": records_with_cwe,
        "severities": SEVERITIES,
        "cwes": [
            {
                "id": cwe,
                "name": cwe_label(cwe),
                "records": totals[cwe],
                "counts": [cells[(cwe, severity)] for severity in SEVERITIES],
            }
            for cwe in top
        ],
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as output:
        json.dump(result, output, indent=1, ensure_ascii=False)
        output.write("\n")
    for item in result["cwes"]:
        print(f'{item["id"]:>9} {item["name"][:34]:<34} {item["records"]:>7}  {item["counts"]}')


if __name__ == "__main__":
    main()
