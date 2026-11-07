"use client";

import { useEffect, useRef, useState } from "react";
import summaryJson from "../data/explorer-summary.json";
import { plural, severityInfo } from "../lib/explorer";
import { toExplorerCve, type ExplorerCve, type ExplorerCveRow, type ExplorerSummary, type ExplorerVendor, type Severity } from "../lib/types";
import { CVEDetails } from "./CVEDetails";
import { CVEYearMap } from "./CVEYearMap";
import { SeverityLevel } from "./SeverityLevel";
import { VendorSelector } from "./VendorSelector";
import "./CVEExplorer.css";

// Caleb's innovative view. Four steps: severity -> vendor -> that vendor's CVEs by year -> one CVE.
// The summary (counts and vendor lists) ships with the page; each vendor's CVEs are a small JSON file in
// public/explorer that is fetched only when the vendor is clicked.

const summary = summaryJson as unknown as ExplorerSummary;

type Loaded = { path: string; status: "loading" | "error" } | { path: string; status: "ready"; cves: ExplorerCve[] };

export function CVEExplorer() {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [vendor, setVendor] = useState<ExplorerVendor | null>(null);
  const [cve, setCve] = useState<ExplorerCve | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const cache = useRef(new Map<string, ExplorerCve[]>());
  const top = useRef<HTMLDivElement>(null);

  const level = cve ? 3 : vendor ? 2 : severity ? 1 : 0;

  // Keep the start of the explorer in view after each step, e.g. after picking a vendor far down the list.
  useEffect(() => {
    const box = top.current?.getBoundingClientRect();
    if (box && box.top < 0) top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [level]);

  const path = severity && vendor ? `/explorer/${severity.toLowerCase()}/${vendor[1]}.json` : null;
  // Only trust what was loaded for the vendor that is selected now.
  const current: Loaded | null = path ? (loaded?.path === path ? loaded : { path, status: "loading" }) : null;

  useEffect(() => {
    if (!path) return;
    const cached = cache.current.get(path);
    if (cached) {
      setLoaded({ path, status: "ready", cves: cached });
      return;
    }
    let cancelled = false;
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json() as Promise<{ cves: ExplorerCveRow[] }>;
      })
      .then((data) => {
        const cves = data.cves.map(toExplorerCve);
        cache.current.set(path, cves);
        if (!cancelled) setLoaded({ path, status: "ready", cves });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ path, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  function goTo(step: number) {
    if (step < 1) setSeverity(null);
    if (step < 2) setVendor(null);
    if (step < 3) setCve(null);
  }

  const severityData = severity ? summary.severities.find((s) => s.key === severity)! : null;
  const crumbs: { label: string; step: number }[] = [
    { label: "All severities", step: 0 },
    ...(severity ? [{ label: severityInfo[severity].label, step: 1 }] : []),
    ...(vendor ? [{ label: vendor[0], step: 2 }] : []),
    ...(cve ? [{ label: cve.id, step: 3 }] : []),
  ];

  return (
    <div ref={top} className="chart-card cve-explorer scroll-mt-20 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="eyebrow text-[#137cbe]">Innovative view · CVEs with a severity and a named vendor</p>
          <h3 className="display mt-1 text-3xl">CVE Vulnerability Explorer</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Each severity level is a habitat: a yellow jacket nest for Critical, a beehive for High, an anthill for Medium and grass for Low.
            Pick a level, then a vendor, to see every one of that vendor&apos;s CVEs as a single insect, grouped by the year it was published.
            Insects with a red ring are CVEs that have been exploited (they are in CISA&apos;s KEV catalog).
          </p>
        </div>
        {level > 0 && (
          <button type="button" onClick={() => goTo(level - 1)} className="explorer-button">
            Back
          </button>
        )}
      </div>

      <nav aria-label="Explorer steps" className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-[#071a2b]/15 py-2 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.step} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-400" aria-hidden="true">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-bold" aria-current="page">{crumb.label}</span>
            ) : (
              <button type="button" onClick={() => goTo(crumb.step)} className="font-bold text-[#137cbe] underline-offset-2 hover:underline">
                {crumb.label}
              </button>
            )}
          </span>
        ))}
      </nav>

      <div className="explorer-step mt-6" key={level}>
        {level === 0 && <SeverityLevel summary={summary} onSelect={setSeverity} />}

        {level === 1 && severityData && (
          <VendorSelector severity={severityData} minCves={summary.minCves} onSelect={setVendor} />
        )}

        {level === 2 && severity && vendor && current && (
          current.status === "ready" ? (
            <CVEYearMap cves={current.cves} vendor={vendor} severity={severity} onSelect={setCve} />
          ) : current.status === "error" ? (
            <p className="py-16 text-center text-sm text-slate-600">
              Could not load {vendor[0]}&apos;s CVEs. Make sure the site is running with <code>npm run dev</code> or <code>npm start</code>, then try again.
            </p>
          ) : (
            <p className="py-16 text-center text-sm text-slate-600" role="status">
              Loading {plural(vendor[2], "CVE")} for {vendor[0]}...
            </p>
          )
        )}

        {level === 3 && severity && vendor && cve && (
          <CVEDetails cve={cve} vendor={vendor[0]} severity={severity} cweNames={summary.cweNames} />
        )}
      </div>
    </div>
  );
}
