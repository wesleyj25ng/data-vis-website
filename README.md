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

Caleb's cleaned CVE dataset is available at `reference-files/cve_data.csv` (about 71 MB). The current website intentionally continues to use clearly labeled illustrative values in `lib/sample-data.ts`: the team is retaining the unfinished charts as prototype placeholders until the visualization owners connect the dataset. The existing annual chart and CWE drill-down therefore do **not** yet represent findings from Caleb's file.

When a teammate is ready to implement a data-backed view, create an analysis-ready aggregate in `data/` and replace the relevant adapter. Document the source, retrieval date, cleaning/aggregation rules, and known gaps in the process book.

## Collaboration map

- `app/page.tsx` — story structure and shared interaction state
- `components/AnnualTrendChart.tsx` — working annual trend view
- `components/CweDrilldown.tsx` — D3 advanced drill-down prototype
- `components/PlaceholderChart.tsx` — replaceable visualization drafts
- `lib/types.ts` — shared data and filter contracts
- `lib/sample-data.ts` — temporary, clearly labeled sample values
- `data/` — cleaned data contract and local data files

This split lets teammates add a visualization in its own component while consuming the same `Filters` shape. Before making claims, connect validated cleaned data and cite the CVE/CVSS/CWE/exploitation sources and all cleaning decisions in the process book.
