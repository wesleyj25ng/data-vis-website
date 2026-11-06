"use client";

import { useMemo, useState } from "react";
import { interpolateRgb } from "d3";
import heatmapData from "../data/cwe-severity-heatmap.json";

// Caleb's CWE heatmap: the 20 most common CWEs by CVSS severity, shaded by number of CVE records.
// The Tableau version has CWEs as columns; here they are rows so every label reads horizontally.

type Cwe = (typeof heatmapData.cwes)[number];
type ColorMode = "count" | "share";
type SortMode = "critical" | "records" | "criticalShare";

const severityLabels = ["Critical", "High", "Medium", "Low"];
const severityShort = ["Crit", "High", "Med", "Low"];
const LIGHT = "#e3f1f8";
const DARK = "#0b3d66";
const ramp = interpolateRgb(LIGHT, DARK);

const sortOptions: { key: SortMode; label: string }[] = [
  { key: "critical", label: "Most Critical CVEs" },
  { key: "records", label: "Most CVEs overall" },
  { key: "criticalShare", label: "Highest share rated Critical" },
];

function scored(cwe: Cwe) {
  return cwe.counts.reduce((sum, n) => sum + n, 0);
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

type Cell = { id: string; severity: number };

export function CweSeverityHeatmap() {
  const [colorMode, setColorMode] = useState<ColorMode>("count");
  const [sortMode, setSortMode] = useState<SortMode>("critical");
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [pinned, setPinned] = useState<Cell | null>(null);
  const active = hovered ?? pinned;

  const cwes = useMemo(() => {
    const list = [...heatmapData.cwes];
    if (sortMode === "records") list.sort((a, b) => b.records - a.records);
    if (sortMode === "criticalShare") list.sort((a, b) => b.counts[0] / scored(b) - a.counts[0] / scored(a));
    return list;
  }, [sortMode]);

  const value = (cwe: Cwe, severity: number) =>
    colorMode === "count" ? cwe.counts[severity] : cwe.counts[severity] / scored(cwe);
  const allValues = cwes.flatMap((cwe) => cwe.counts.map((_, s) => value(cwe, s)));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const color = (v: number) => ramp(max > min ? (v - min) / (max - min) : 0);
  const legendLabel = (v: number) => (colorMode === "count" ? Math.round(v).toLocaleString() : percent(v));

  const activeCwe = active ? cwes.find((c) => c.id === active.id) : undefined;

  return (
    <div className="chart-card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <p className="eyebrow text-[#137cbe]">CVE List · CVEs with a CWE and a CVSS severity</p>
          <h3 className="display mt-1 text-3xl">CWE heatmap: weakness type by severity</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The 20 weakness types (CWEs) with the most CVE records, split by CVSS severity.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
        <label className="text-sm font-bold">
          <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">Shade cells by</span>
          <select
            className="w-64 border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            value={colorMode}
            onChange={(event) => setColorMode(event.target.value as ColorMode)}
          >
            <option value="count">Number of CVEs</option>
            <option value="share">Share of that CWE&apos;s scored CVEs</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">Order rows by</span>
          <select
            className="w-64 border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            {sortOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        <div className="pb-1 text-xs">
          <span className="terminal-label block text-[9px] text-slate-500">
            {colorMode === "count" ? "CVE records" : "Share of the row"}
          </span>
          <span className="mt-1 block h-2.5 w-48" style={{ background: `linear-gradient(90deg, ${LIGHT}, ${DARK})` }} />
          <span className="flex w-48 justify-between tabular-nums text-slate-600"><span>{legendLabel(min)}</span><span>{legendLabel(max)}</span></span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div
          className="grid min-w-0 gap-[2px] self-start"
          style={{ gridTemplateColumns: "minmax(0, 18rem) repeat(4, minmax(2.25rem, 1fr))" }}
          onMouseLeave={() => setHovered(null)}
        >
          <span />
          {severityLabels.map((label, s) => (
            <span key={label} className="terminal-label pb-1 text-center text-[10px] text-slate-600">
              <span className="md:hidden">{severityShort[s]}</span>
              <span className="hidden md:inline">{label}</span>
            </span>
          ))}
          {cwes.map((cwe) => (
            <div key={cwe.id} className="contents">
              <span
                className={`flex min-w-0 items-center gap-1.5 pr-2 text-xs ${active?.id === cwe.id ? "font-bold" : ""}`}
                title={`${cwe.id} ${cwe.name}`}
              >
                <span className="w-[3.6rem] shrink-0 tabular-nums text-slate-500 md:w-[4.1rem]">{cwe.id}</span>
                <span className="truncate">{cwe.name}</span>
              </span>
              {cwe.counts.map((n, s) => {
                const isActive = active?.id === cwe.id && active.severity === s;
                const isPinned = pinned?.id === cwe.id && pinned.severity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-label={`${cwe.id} ${cwe.name}, ${severityLabels[s]}: ${n.toLocaleString()} CVEs`}
                    aria-pressed={isPinned}
                    className="block h-6 rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#071a2b]"
                    style={{ background: color(value(cwe, s)), outline: isActive ? "2px solid #071a2b" : undefined, outlineOffset: -1 }}
                    onMouseEnter={() => setHovered({ id: cwe.id, severity: s })}
                    onFocus={() => setHovered({ id: cwe.id, severity: s })}
                    onBlur={() => setHovered(null)}
                    onClick={() => setPinned(isPinned ? null : { id: cwe.id, severity: s })}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <aside className="min-w-0 border-t border-[#071a2b]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="eyebrow text-[#137cbe]">Read the chart</p>
          <p className="mt-3 text-sm leading-6">
            Cross-site scripting (CWE-79) is by far the most common weakness, but most of those CVEs are rated Medium.
          </p>
          <p className="mt-3 text-sm leading-6">
            The top three for Critical CVEs are all injection bugs: SQL injection (CWE-89), OS command injection (CWE-78) and code
            injection (CWE-94). Switch to <b>share</b> shading to compare rows of different sizes.
          </p>

          <div className="mt-6 border border-[#071a2b]/20 bg-white/80 p-4" aria-live="polite">
            {activeCwe && active ? (
              <>
                <p className="text-xs tabular-nums text-slate-500">{activeCwe.id}</p>
                <p className="font-bold">{activeCwe.name}</p>
                <p className="mt-1 text-xs text-slate-600">{activeCwe.records.toLocaleString()} CVE records in total, {scored(activeCwe).toLocaleString()} with a severity</p>
                <div className="mt-3 space-y-1.5">
                  {activeCwe.counts.map((n, s) => (
                    <div key={s} className={`grid grid-cols-[4rem_1fr_auto] items-center gap-2 text-xs ${s === active.severity ? "font-bold" : "text-slate-600"}`}>
                      <span>{severityLabels[s]}</span>
                      <span className="block h-2.5 rounded-r-[3px] bg-[#137cbe]" style={{ width: `${(n / Math.max(...activeCwe.counts)) * 100}%`, opacity: s === active.severity ? 1 : 0.45 }} />
                      <span className="tabular-nums">{n.toLocaleString()} · {percent(n / scored(activeCwe))}</span>
                    </div>
                  ))}
                </div>
                {pinned && !hovered && (
                  <button type="button" onClick={() => setPinned(null)} className="mt-3 text-xs font-bold text-[#137cbe]">Clear selection</button>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">Hover or tap a cell to see that weakness broken down by severity.</p>
            )}
          </div>
        </aside>
      </div>

      <details className="mt-5 text-xs">
        <summary className="cursor-pointer font-bold text-[#137cbe]">Show as a table</summary>
        <table className="mt-2 w-full max-w-3xl text-left tabular-nums">
          <thead><tr className="border-b border-[#071a2b]/20"><th className="py-1">Weakness</th>{severityLabels.map((l) => <th key={l}>{l}</th>)}<th>All CVEs</th></tr></thead>
          <tbody>{cwes.map((cwe) => <tr key={cwe.id} className="border-b border-[#071a2b]/10"><td className="py-1">{cwe.id} {cwe.name}</td>{cwe.counts.map((n, s) => <td key={s}>{n.toLocaleString()}</td>)}<td>{cwe.records.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </details>

      <p className="mt-4 border-t border-[#071a2b]/15 pt-3 text-xs leading-5 text-slate-500">
        Data: team-cleaned CVE dataset, {heatmapData.recordsWithCwe.toLocaleString()} CVE records with at least one CWE. Each cell counts CVE records with
        that CWE and CVSS severity; a CVE with two CWEs counts under both. Rows are the 20 CWEs with the most records. Records with no CVSS
        severity count toward the total but are not shown as a column.
      </p>
    </div>
  );
}