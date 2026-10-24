"use client";
import * as d3 from "d3";
import { cweSample } from "../lib/sample-data";
import { CwePoint, Filters } from "../lib/types";

export function CweDrilldown({ filters, setFilters }: { filters: Filters; setFilters: (filters: Filters) => void }) {
 const root = d3.hierarchy<{ children?: CwePoint[] } & Partial<CwePoint>>({ children: cweSample }).sum((d) => d.count ?? 0);
 const packed = d3.pack<typeof root.data>().size([470, 310]).padding(8)(root);
 const leaves = packed.leaves();
 return <div className="chart-card p-5"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#137cbe]">Attack-surface map · prototype</p><h3 className="display mt-1 text-3xl">Weakness constellation</h3></div><span className="terminal-label max-w-32 text-right text-[10px] text-slate-500">Click a node to inspect</span></div><svg viewBox="0 0 470 310" className="mt-4 w-full" aria-label="Interactive CWE packed-circle prototype">{leaves.map((node, i) => { const d = node.data as CwePoint; const active = filters.cwe === d.cwe; return <g key={d.cwe} transform={`translate(${node.x},${node.y})`} className="cursor-pointer" onClick={() => setFilters({ ...filters, cwe: active ? null : d.cwe })}><circle r={node.r} fill={active ? "#c7f464" : ["#137cbe", "#52a9d6", "#f0aa48"][i % 3]} stroke="#071a2b" strokeWidth={active ? 3 : 1}/><text textAnchor="middle" dy=".35em" fontSize={node.r > 43 ? 11 : 9} fontWeight="700" fill="#071a2b">{d.cwe.replace("CWE-", "")}</text></g>; })}</svg><div className="border-t border-[#071a2b]/15 pt-3 text-sm"><span className="terminal-label text-[#137cbe]">Selected: </span><span className="font-bold">{filters.cwe ?? "No weakness selected"}</span>{filters.cwe && <span className="ml-2 text-slate-600">{cweSample.find((d) => d.cwe === filters.cwe)?.label}</span>}</div></div>;
}
