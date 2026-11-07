# CVEs: Profiling Software Vulnerabilities over the Years

Group project for CS 6730 Data Visualization: Principles and Applications (Fall 2026).

Team Can Visualize Everything: Abhinav Shaurya Agarwal, Arkishman Ghosh, Wesley Jeong, Robert Caleb Jones, Brian Yang

Our website is a scrolling data story about CVEs, which are publicly reported software vulnerabilities. It looks at how many get published each year, how severe they are, what kinds of weaknesses (CWEs) cause them, and which ones attackers actually exploit. It is written for software developers. We built it with Next.js, Recharts and D3.

## Running the website

You'll need Node.js 20.9 or newer. You can check your version with `node -v`. If it's older, download the LTS version from https://nodejs.org (npm comes with it).

In a terminal, go to this folder and run:

```bash
npm install
npm run dev
```

`npm install` needs internet and takes around 30 seconds. Once `npm run dev` is running, open http://localhost:3000. If port 3000 is already taken, Next.js will pick another port and print the link in the terminal.

For a faster version of the site, run `npm run build` and then `npm start` instead of `npm run dev`.

## Sections

- **01 Trends**: CVE records by year. Filter by CVSS severity, record status and assigner. Click a year to select it; the spider chart and the heatmap switch to that year.
- **02 Patterns**: a spider chart of the risk profile for one publication year, compared with all years, and the vendor exploitation chart (published CVEs vs CVEs in CISA's KEV catalog, per vendor). Rank vendors with the dropdown, change how many are shown with the slider, and click a vendor to see which weakness types were exploited.
- **03 Severity**: a heatmap of the 20 most common weakness types (CWEs) by CVSS severity. Shade cells by count or by share, reorder the rows, and hover or tap a cell for its numbers.
- **04 Explorer**: the CVE Vulnerability Explorer. Pick a severity, then a vendor, to see each of that vendor's CVEs as an insect, grouped by year. Click one to see its details.
- **05 Notes**: our findings, the limits of the data, and sources.

The year picked in the trend chart (or with the spider chart's slider) and the weakness picked in the vendor chart or heatmap are shared between charts. The current selection shows in a bar at the bottom right, with a Clear button.

## Code

- `app/page.tsx` has the page layout and the story text
- Each chart is its own file in `components/`: AnnualTrendChart, CveSpiderChart, VendorExploitationChart, CweSeverityHeatmap, and CVEExplorer (with SeverityLevel, VendorSelector, CVEYearMap and CVEDetails for its four steps)
- `data/` has the small data files the charts load with the page
- `public/explorer/` has one file per vendor and severity for the explorer, loaded only when that vendor is clicked
- `public/images/` has the explorer's drawings
- `scripts/` has the Python scripts we used to make the data files
- `lib/` has shared types and helpers

## Data

Everything the site needs is in `data/` and `public/`, so you don't need anything else to run it. These files were made from our cleaned dataset (`cve_data.csv`, about 74 MB, built from the CVE List V5 and CISA's Known Exploited Vulnerabilities catalog). You don't need it to run the site, but you can download it here: https://drive.google.com/file/d/1VCMeUCA9ldz7FILtE6PfnhclhxqQ1FCR/view?usp=drive_link

## Rebuilding the chart data

If the cleaned dataset changes, put `cve_data.csv` in this folder and rerun the scripts (Python 3, no extra packages needed), then restart the site:

```bash
python scripts/build-annual-trend-data.py cve_data.csv data/cve-annual-trend.json
python scripts/build-cve-profile-data.py cve_data.csv data/cve-profile.json
python scripts/build-vendor-exploitation-data.py cve_data.csv data/vendor-exploitation.json
python scripts/build-cwe-severity-heatmap-data.py cve_data.csv data/cwe-severity-heatmap.json
python scripts/build-explorer-data.py cve_data.csv path/to/cvelistV5/cves
```

The explorer script writes `data/explorer-summary.json` and the files in `public/explorer/`. Its second argument is the `cves` folder of a copy of https://github.com/CVEProject/cvelistV5, which it uses for the CVE descriptions. Without it, the explorer works but shows no descriptions.

`python scripts/input-handling-stats.py cve_data.csv` prints the input-handling percentages quoted on the page.

The vendor, heatmap, explorer and stats scripts share `scripts/cve_labels.py` (vendor name merging, short CWE names and the input-handling CWE group) and `scripts/cwe_names.json` (official CWE names).
