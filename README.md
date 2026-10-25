# CVEs: Profiling Software Vulnerabilities over the Years

Group project for CS 6730 Data Visualization: Principles and Applications (Fall 2026).

Team Can Visualize Everything: Abhinav Shaurya Agarwal, Arkishman Ghosh, Wesley Jeong, Robert Caleb Jones, Brian Yang

Our website is a scrolling data story about CVEs, which are publicly reported software vulnerabilities. It looks at how many get published each year, how severe they are, and what kinds of weaknesses (CWEs) cause them. We built it with Next.js, Recharts and D3.

## Running the website

You'll need Node.js 20.9 or newer. You can check your version with `node -v`. If it's older, download the LTS version from https://nodejs.org (npm comes with it).

In a terminal, go to this folder and run:

```bash
npm install
npm run dev
```

`npm install` needs internet and takes around 30 seconds. Once `npm run dev` is running, open http://localhost:3000. If port 3000 is already taken, Next.js will pick another port and print the link in the terminal.

## Sections

- **Trends**: CVE records by year. You can filter by CVSS severity, record status and assigner, and click on a year to select it.
- **Patterns**: a spider chart of the overall risk profile for a publication year, which you can compare with all years. This section also has two placeholders (CWE prevalence and exploitation comparison) for views we're still working on.
- **Priorities**: a CWE funnel. The buttons switch the shading between volume, severity and exploitation.
- **Explorer**: a D3 "weakness constellation". Click a circle to select a weakness. This one still uses sample data.

## Code

- `app/page.tsx` has the page layout and the story text
- Each chart is its own file in `components/` (AnnualTrendChart, CveSpiderChart, CweFunnel, CweDrilldown, and PlaceholderChart for the placeholders)
- `data/` has the data files the charts use
- `scripts/` has the Python scripts we used to make those files
- `lib/` has shared types and the sample data for the Explorer view

## Data

The site only uses the small files in `data/`, which are included. We left out the full cleaned dataset (`cve_data.csv`, about 74 MB, made from the CVE List V5 and CISA's Known Exploited Vulnerabilities catalog) since it's too big to submit, and you don't need it to run the site. You can download it here: https://drive.google.com/file/d/1VCMeUCA9ldz7FILtE6PfnhclhxqQ1FCR/view?usp=drive_link
