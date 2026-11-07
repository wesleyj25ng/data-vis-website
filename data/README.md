# Chart data

These files are made from our cleaned dataset (`cve_data.csv`) by the scripts in `../scripts`. See the main README for the commands.

| File | Used by | Made by |
| --- | --- | --- |
| `cve-annual-trend.json` | Trend chart | `build-annual-trend-data.py` |
| `cve-profile.json` | Spider chart | `build-cve-profile-data.py` |
| `vendor-exploitation.json` | Vendor exploitation chart | `build-vendor-exploitation-data.py` |
| `cwe-severity-heatmap.json` | CWE heatmap | `build-cwe-severity-heatmap-data.py` |
| `explorer-summary.json` | CVE explorer (counts and vendor lists) | `build-explorer-data.py` |

The explorer's per-vendor files are in `../public/explorer/`, because the page fetches them only when a vendor is clicked.

`cve-annual-trend-rawgraphs.csv` and `cve-profile-rawgraphs.csv` are small exports we used for our RAWGraphs drafts. The site does not load them.
