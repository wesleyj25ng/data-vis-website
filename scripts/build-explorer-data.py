"""Data for the CVE Vulnerability Explorer (Caleb's innovative view).

Usage:
  python scripts/build-explorer-data.py INPUT.csv [DESCRIPTIONS]

INPUT.csv is the team's cleaned cve_data.csv. DESCRIPTIONS is optional and can be either
  - a folder with the CVE List V5 records (https://github.com/CVEProject/cvelistV5, the "cves" folder), or
  - a JSON file in the old explorer format (severity -> vendors -> list of records with a "Description").
Without it the explorer still works but shows no descriptions.

Rules (same as the rest of the site):
- only PUBLISHED records with a CVSS severity (Critical, High, Medium or Low)
- vendor = the "Vendor" column with spelling variants merged (see cve_labels.py)
- years come from Date Published
- a vendor is listed under a severity if it has at least 10 CVEs with that severity

Outputs:
  data/explorer-summary.json                small file the page loads right away: counts and vendor lists
  public/explorer/<severity>/<vendor>.json  one file per vendor and severity, fetched only when that vendor is clicked.
                                            Each CVE is a list: [id, product, score, published, reserved, cwes, inKev,
                                            dateAddedToKev, assigner, description]
"""
import csv
import html
import json
import re
import shutil
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cve_labels import NAMES, cwe_label, vendor_key  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SUMMARY_PATH = ROOT / "data" / "explorer-summary.json"
FILES_DIR = ROOT / "public" / "explorer"
SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
MIN_CVES = 10
MAX_DESCRIPTION = 400


def clean(value):
    value = html.unescape(value or "").strip()
    return "" if value.lower() in {"n/a", "none"} else value


def shorten(text):
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= MAX_DESCRIPTION:
        return text
    cut = text[:MAX_DESCRIPTION].rsplit(" ", 1)[0].rstrip(",;:")
    return cut + "..."


def english_description(record):
    descriptions = record.get("containers", {}).get("cna", {}).get("descriptions", [])
    chosen = next((d for d in descriptions if d.get("lang", "").startswith("en")), descriptions[0] if descriptions else None)
    return chosen.get("value", "") if chosen else ""


def load_descriptions(path, wanted):
    """CVE ID -> description, from a cvelistV5 folder or the old explorer JSON."""
    if path is None:
        return {}
    path = Path(path)
    found = {}
    if path.is_dir():
        for file in path.rglob("CVE-*.json"):
            if file.stem in wanted:
                record = json.loads(file.read_text(encoding="utf-8"))
                found[file.stem] = english_description(record)
    else:
        grouped = json.loads(path.read_text(encoding="utf-8"))
        for severity in grouped.values():
            for records in severity.get("vendors", {}).values():
                for record in records:
                    text = record.get("Description", "")
                    if text and text != "N/A":
                        found[record["CVE ID"]] = text
    return found


def main():
    if len(sys.argv) not in (2, 3):
        raise SystemExit("Usage: python scripts/build-explorer-data.py INPUT.csv [DESCRIPTIONS]")
    input_path = Path(sys.argv[1])

    rows = []
    spellings = defaultdict(Counter)
    with input_path.open(newline="", encoding="utf-8-sig") as source:
        for row in csv.DictReader(source):
            severity = row["CVSS Severity"].strip().upper()
            if row["State"].strip().upper() != "PUBLISHED" or severity not in SEVERITIES:
                continue
            raw_vendor = clean(row["Vendor"])
            key = vendor_key(raw_vendor) if raw_vendor else None
            if not key:
                continue
            spellings[key][raw_vendor] += 1
            rows.append((severity, key, row))

    descriptions = load_descriptions(sys.argv[2] if len(sys.argv) == 3 else None, {row["CVE ID"] for _, _, row in rows})

    def name(key):
        return NAMES.get(key, spellings[key].most_common(1)[0][0])

    grouped = {severity: defaultdict(list) for severity in SEVERITIES}
    for severity, key, row in rows:
        grouped[severity][key].append(row)

    if FILES_DIR.exists():
        shutil.rmtree(FILES_DIR)
    cwes_used = set()
    summary = {"minCves": MIN_CVES, "severities": []}
    files_written = 0
    missing_descriptions = 0

    for severity in SEVERITIES:
        vendors = grouped[severity]
        listed = sorted(((k, v) for k, v in vendors.items() if len(v) >= MIN_CVES), key=lambda kv: (-len(kv[1]), name(kv[0])))
        folder = FILES_DIR / severity.lower()
        folder.mkdir(parents=True, exist_ok=True)
        vendor_rows = []
        for key, records in listed:
            cves = []
            for row in records:
                cwes = sorted(set(re.findall(r"CWE-\d+", row["CVE Problem Types"])), key=lambda c: int(c[4:]))
                cwes_used.update(cwes)
                description = shorten(descriptions.get(row["CVE ID"], ""))
                missing_descriptions += not description
                in_kev = row["Is in KEV"].strip() == "True"
                score = clean(row["CVSS Score"])
                cves.append([
                    row["CVE ID"],
                    clean(row["Product"]),
                    float(score) if score else None,
                    row["Date Published"][:10],
                    clean(row["Date Reserved"])[:10],
                    cwes,
                    1 if in_kev else 0,
                    clean(row["Date Added to KEV"])[:10] if in_kev else "",
                    clean(row["Assigner Short Name"]),
                    description,
                ])
            # newest first, and within a day the exploited and highest scoring first
            cves.sort(key=lambda c: (c[3], c[6], c[2] or 0), reverse=True)
            with (folder / f"{key}.json").open("w", encoding="utf-8", newline="\n") as output:
                json.dump({"vendor": name(key), "severity": severity, "cves": cves}, output, ensure_ascii=False, separators=(",", ":"))
            files_written += 1
            vendor_rows.append([name(key), key, len(records), sum(1 for c in cves if c[6])])
        summary["severities"].append({
            "key": severity,
            "count": sum(len(v) for v in vendors.values()),
            "kev": sum(1 for v in vendors.values() for r in v if r["Is in KEV"].strip() == "True"),
            "vendorCount": len(vendors),
            "vendors": vendor_rows,
        })

    summary["cweNames"] = {c: cwe_label(c) for c in sorted(cwes_used, key=lambda c: int(c[4:]))}
    with SUMMARY_PATH.open("w", encoding="utf-8", newline="\n") as output:
        json.dump(summary, output, ensure_ascii=False, separators=(",", ":"))
        output.write("\n")

    total = sum(1 for _ in FILES_DIR.rglob("*.json"))
    size = sum(f.stat().st_size for f in FILES_DIR.rglob("*.json"))
    print(f"{files_written} vendor files ({total} on disk, {size / 1e6:.1f} MB), summary {SUMMARY_PATH.stat().st_size / 1e3:.0f} KB")
    print(f"CVEs without a description: {missing_descriptions}")
    for s in summary["severities"]:
        print(f'{s["key"]:<9} {s["count"]:>6} CVEs, {s["kev"]:>4} in KEV, {len(s["vendors"]):>4} vendors listed of {s["vendorCount"]}')


if __name__ == "__main__":
    main()
