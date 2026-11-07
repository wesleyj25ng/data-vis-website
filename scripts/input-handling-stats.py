"""Numbers behind the "input handling" takeaway in the Notes section.

Usage: python scripts/input-handling-stats.py INPUT.csv

Prints how many published CVEs with a CWE have an input-handling weakness (see INPUT_HANDLING_CWES in
cve_labels.py), overall, among Critical CVEs, and among CVEs in CISA's KEV catalog.
"""
import csv
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cve_labels import INPUT_HANDLING_CWES  # noqa: E402


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/input-handling-stats.py INPUT.csv")
    groups = {"all": [0, 0], "critical": [0, 0], "kev": [0, 0]}  # [with an input-handling CWE, with any CWE]
    with Path(sys.argv[1]).open(newline="", encoding="utf-8-sig") as source:
        for row in csv.DictReader(source):
            if row["State"].strip().upper() != "PUBLISHED":
                continue
            cwes = {int(c[4:]) for c in re.findall(r"CWE-\d+", row["CVE Problem Types"])}
            if not cwes:
                continue
            hit = bool(cwes & INPUT_HANDLING_CWES)
            keys = ["all"]
            if row["CVSS Severity"].strip().upper() == "CRITICAL":
                keys.append("critical")
            if row["Is in KEV"].strip() == "True":
                keys.append("kev")
            for key in keys:
                groups[key][0] += hit
                groups[key][1] += 1
    for key, (hits, total) in groups.items():
        print(f"{key:<9} {hits:>7,} of {total:>7,} CVEs with a CWE = {hits / total:.1%}")


if __name__ == "__main__":
    main()
