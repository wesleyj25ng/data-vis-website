"use client";
import { useState } from "react";
import data from "../data/cwe-severity.json";

const SEV_LABEL: Record<string, string> = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
const COL_W = 70, ROW_H = 62, LEFT = 74, TOP = 12, GAP = 4;
const W = LEFT + data.cwes.length * COL_W, H = TOP + data.severities.length * ROW_H + 34;
const count = (c: (typeof data.cwes)[number], s: string) => c.counts[s as keyof typeof c.counts];
const max = Math.max(...data.cwes.flatMap((c) => data.severities.map((s) => count(c, s))));
// Square-root scale: raw counts span ~40 to ~17,000, so a linear ramp would wash out most cells.
const t = (n: number) => Math.sqrt(n / max);
const fill = (n: number) => `rgb(${Math.round(232 - 213 * t(n))},${Math.round(241 - 117 * t(n))},${Math.round(247 - 57 * t(n))})`;
const excluded = data.cwes.reduce((a, c) => a + c.total, 0) - data.plottedRecords;

export function CweSeverityHeatmap() {
 const [hover, setHover] = useState<{ c: number; s: number } | null>(null);
 const cell = hover && { cwe: data.cwes[hover.c], sev: data.severities[hover.s] };
 return <div className="chart-card p-5 md:p-6">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-[#137cbe]">Frequency of CVE severity by CWE</p><h3 className="display mt-1 text-3xl">Ten most-reported weaknesses</h3></div>
   <div><p className="terminal-label text-[10px] text-slate-500">Frequency (CVEs)</p><div className="mt-1 h-3 w-44 border border-[#071a2b]/20" style={{ background: `linear-gradient(90deg, ${fill(0)}, ${fill(max)})` }}/><div className="terminal-label mt-1 flex justify-between text-[9px] text-slate-500"><span>0</span><span>{max.toLocaleString("en-US")}</span></div></div></div>
  <div className="mt-4 overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="min-w-[640px] w-full" role="img" aria-label="Heatmap of CVE counts by CWE and CVSS severity">
   {data.severities.map((s, r) => <text key={s} x={LEFT - 10} y={TOP + r * ROW_H + ROW_H / 2} textAnchor="end" dy=".35em" fontSize="12" fontWeight="700" fill="#071a2b">{SEV_LABEL[s]}</text>)}
   {data.cwes.map((c, i) => <g key={c.cwe}><text x={LEFT + i * COL_W + COL_W / 2} y={TOP + data.severities.length * ROW_H + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#071a2b">{c.cwe}</text>
    {data.severities.map((s, r) => { const n = count(c, s); const on = hover?.c === i && hover.s === r; return <g key={s} tabIndex={0} onMouseEnter={() => setHover({ c: i, s: r })} onMouseLeave={() => setHover(null)} onFocus={() => setHover({ c: i, s: r })} onBlur={() => setHover(null)} aria-label={`${c.cwe} ${c.name}, ${SEV_LABEL[s]}: ${n.toLocaleString("en-US")} CVEs`}>
     <rect x={LEFT + i * COL_W + GAP / 2} y={TOP + r * ROW_H + GAP / 2} width={COL_W - GAP} height={ROW_H - GAP} fill={fill(n)} stroke={on ? "#071a2b" : "none"} strokeWidth="2"/>
     <text x={LEFT + i * COL_W + COL_W / 2} y={TOP + r * ROW_H + ROW_H / 2} textAnchor="middle" dy=".35em" fontSize="11" fill={t(n) > 0.55 ? "#fff" : "#071a2b"} pointerEvents="none">{n.toLocaleString("en-US")}</text></g>; })}</g>)}
   <text x={LEFT + (data.cwes.length * COL_W) / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="#49616e" letterSpacing="2">CWE</text>
  </svg></div>
  <div className="mt-3 border-t border-[#071a2b]/15 pt-3 text-sm"><span className="terminal-label text-[#137cbe]">{cell ? "Selected: " : "Hover a cell"}</span>{cell && <><span className="font-bold">{cell.cwe.cwe} · {cell.cwe.name} · {SEV_LABEL[cell.sev]}</span><span className="ml-2 text-slate-600">{count(cell.cwe, cell.sev).toLocaleString("en-US")} CVEs ({((count(cell.cwe, cell.sev) / cell.cwe.total) * 100).toFixed(1)}% of all {cell.cwe.total.toLocaleString("en-US")} {cell.cwe.cwe} records)</span></>}</div>
  <p className="mt-3 text-xs leading-5 text-slate-500">Cell color is the raw CVE count on a square-root scale. Shows {data.plottedRecords.toLocaleString("en-US")} CVEs with both a CWE and a CVSS severity; {excluded.toLocaleString("en-US")} CVEs with these ten CWEs have no severity and are excluded. CVEs with several CWEs are counted under the first one listed.</p>
 </div>;
}
