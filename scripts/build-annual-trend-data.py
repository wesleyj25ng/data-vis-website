import csv
import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/build-annual-trend-data.py INPUT.csv OUTPUT.json")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    counts = Counter()
    years = set()
    statuses = set()
    severities = set()
    assigners = set()
    source_rows = 0
    excluded_undated = 0

    with input_path.open(newline="", encoding="utf-8-sig") as source:
        reader = csv.DictReader(source)
        required = {"Date Published", "State", "CVSS Severity", "Assigner Short Name"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing required CSV columns: {', '.join(sorted(missing))}")

        for row in reader:
            source_rows += 1
            published = row["Date Published"].strip()
            if not published or published.casefold() == "n/a":
                excluded_undated += 1
                continue

            date.fromisoformat(published[:10])
            year = int(published[:4])
            status = row["State"].strip().upper() or "UNKNOWN"
            severity = row["CVSS Severity"].strip().upper()
            if not severity or severity == "N/A":
                severity = "UNSCORED"
            assigner = row["Assigner Short Name"].strip() or "Unknown assigner"

            counts[(year, status, severity, assigner)] += 1
            years.add(year)
            statuses.add(status)
            severities.add(severity)
            assigners.add(assigner)

    year_list = sorted(years)
    status_list = sorted(statuses)
    severity_list = sorted(severities)
    assigner_list = sorted(assigners, key=str.casefold)
    year_index = {value: index for index, value in enumerate(year_list)}
    status_index = {value: index for index, value in enumerate(status_list)}
    severity_index = {value: index for index, value in enumerate(severity_list)}
    assigner_index = {value: index for index, value in enumerate(assigner_list)}
    records = [
        [
            year_index[year],
            status_index[status],
            severity_index[severity],
            assigner_index[assigner],
            count,
        ]
        for (year, status, severity, assigner), count in sorted(counts.items())
    ]

    result = {
        "sourceRows": source_rows,
        "includedRecords": sum(counts.values()),
        "excludedUndatedRecords": excluded_undated,
        "years": year_list,
        "statuses": status_list,
        "severities": severity_list,
        "assigners": assigner_list,
        "records": records,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as output:
        json.dump(result, output, separators=(",", ":"))
        output.write("\n")
    print(
        f"Wrote {len(records):,} grouped counts covering {result['includedRecords']:,} "
        f"dated records to {output_path}"
    )


if __name__ == "__main__":
    main()
