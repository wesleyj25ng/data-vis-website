# CVE Atlas — Georgia Tech CS 6730

An interactive, scroll-based project starter for **“CVEs: Profiling Software Vulnerabilities Over the Years.”** It has five narrative sections, a responsive sticky navigation, shared linked-filter state, a functional Recharts annual trend interaction, and a D3 packed-circle drill-down prototype.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Recharts, and D3.js.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production check

```bash
npm run build
npm run start
```

## Data

The annual trend and CVE risk-profile spider chart use aggregates generated from the ignored root-level `cve_data.csv` file. The CWE drill-down continues to use illustrative values from `lib/sample-data.ts`.

Regenerate both chart data files after updating the source CSV:

```bash
python scripts/build-cve-profile-data.py cve_data.csv data/cve-profile.json
python scripts/build-annual-trend-data.py cve_data.csv data/cve-annual-trend.json
```

The spider aggregate includes published records with a valid publication date. The annual trend includes any status with a valid publication date and supports filtering by severity, status, and assigner. Neither aggregate contains record-level CVE data.

### Spider chart

The interactive spider chart in `components/CveSpiderChart.tsx` compares one publication year with an all-years baseline. Its source is `data/cve-profile.json`, generated from `cve_data.csv`. It includes `PUBLISHED` records with a valid publication date; rejected and undated records are excluded. An `n/a` in a field does not remove a record from the dataset, but it can mean the record does not contribute to the corresponding metric. The aggregate currently contains 395,208 records.

The five spokes are:

| Spoke | Meaning and calculation | Scale |
|---|---|---|
| **CVSS coverage** | Records with a numeric CVSS score ÷ all included records × 100. | Percent, 0–100. |
| **High / critical** | Scored records whose CVSS severity is `HIGH` or `CRITICAL` ÷ all scored records × 100. | Percent, 0–100. |
| **Vendor diversity** | For each year, count distinct non-empty Vendor labels per 1,000 included records. `n/a` and `Unknown` labels are not counted; labels are deduplicated without regard to case. | Indexed: yearly rate ÷ highest yearly rate × 100. The peak is 2025 at 192.21 distinct vendors per 1,000 records (100 index points). The tooltip reports the unindexed rate. |
| **CWE identified** | Records whose CVE Problem Types contains a `CWE-` identifier ÷ all included records × 100. | Percent, 0–100. |
| **Mean CVSS / 10** | Arithmetic mean of numeric CVSS scores, multiplied by 10 to put it on a 0–100 display scale. | Scaled score, 0–100; this is not a percentage. |

The all-years values for the four non-vendor spokes are calculated over all included records using each measure's denominator above. The all-years vendor rate is the record-weighted average of annual vendor rates (sum of each year's distinct-vendor count ÷ total records × 1,000); a vendor appearing in multiple years contributes once in each year. Its radar value is indexed using the same 2025 maximum as the yearly values.

## Collaboration map

- `app/page.tsx` — story structure and shared interaction state
- `components/AnnualTrendChart.tsx` — working annual trend view
- `components/CweDrilldown.tsx` — D3 advanced drill-down prototype
- `components/PlaceholderChart.tsx` — replaceable visualization drafts
- `lib/types.ts` — shared data and filter contracts
- `lib/sample-data.ts` — temporary, clearly labeled sample values
- `data/` — cleaned data contract and local data files

This split lets teammates add a visualization in its own component while consuming the same `Filters` shape. Before making claims, connect validated cleaned data and cite the CVE/CVSS/CWE/exploitation sources and all cleaning decisions in the process book.
