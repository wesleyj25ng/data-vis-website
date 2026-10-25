"use client";
import { useState } from "react";

type MetricKey = "share" | "sev" | "kev";

const DATA = [
 { name: "Input Validation", count: 84000, share: 39.4, kev: 0.70, sev: 31.9, color: "var(--cf-slot-1)", path: "M 10,10 L 610,10 L 490,130 L 130,130 Z", y: 60 },
 { name: "Auth", count: 31461, share: 14.7, kev: 0.62, sev: 36.9, color: "var(--cf-slot-2)", path: "M 130,142 L 490,142 L 410,262 L 210,262 Z", y: 195 },
 { name: "Memory Safety", count: 35275, share: 16.5, kev: 1.12, sev: 42.9, color: "var(--cf-slot-3)", path: "M 210,274 L 410,274 L 350,394 L 270,394 Z", y: 327 },
 { name: "Other", count: 62638, share: 29.4, kev: 0.59, sev: 33.3, color: "var(--cf-slot-4)", path: "M 270,406 L 350,406 L 318,526 L 302,526 Z", y: 455 },
];

const METRICS: { key: MetricKey; label: string; fmt: (d: typeof DATA[number]) => string }[] = [
 { key: "share", label: "Volume", fmt: d => `${d.share.toFixed(1)}% of CVEs` },
 { key: "sev", label: "Severity", fmt: d => `${d.sev.toFixed(1)}% High/Critical` },
 { key: "kev", label: "Exploitation", fmt: d => `${d.kev.toFixed(2)}% in KEV` },
];

const MIN_OPACITY = 0.4;
const maxOf = (k: MetricKey) => Math.max(...DATA.map(d => d[k]));

export function CweFunnel() {
 const [metric, setMetric] = useState<MetricKey>("share");
 const [hover, setHover] = useState<number | null>(null);
 const fmt = METRICS.find(m => m.key === metric)!.fmt;
 const max = maxOf(metric);
 const hoverProps = (i: number) => ({ tabIndex: 0, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover(null), onFocus: () => setHover(i), onBlur: () => setHover(null) });
 const dim = (i: number) => hover !== null && hover !== i;
 return <div className="cwe-funnel">
  <div className="cf-toolbar"><span className="cf-toolbar-label">Shade bands by</span>
   <div className="cf-toggle" role="group" aria-label="Metric used to shade each band">{METRICS.map(m => <button key={m.key} type="button" aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</button>)}</div>
  </div>
  <div className="chart-card cf-panel">
   <div className="cf-grid">
    <div className="cf-axis"><span className="cf-axis-tag">High priority</span><div className="cf-axis-track"/><span className="cf-axis-tag">Low priority</span></div>
    <svg viewBox="0 0 620 560" preserveAspectRatio="xMidYMin meet" role="img" aria-label="Funnel of four CWE categories, shaded by the selected metric">
     {DATA.map((d, i) => { const last = i === 3; return <g key={d.name} className={`cf-band${dim(i) ? " dim" : ""}${hover === i ? " active" : ""}`} {...hoverProps(i)}>
      <path d={d.path} fill={d.color} style={{ fillOpacity: MIN_OPACITY + (1 - MIN_OPACITY) * (d[metric] / max) }}/>
      <text x={last ? 340 : 310} y={d.y} className="cf-band-label" textAnchor={last ? "start" : "middle"} fill={last ? "var(--cf-ink)" : "var(--cf-label-light)"} fontSize={last ? 14 : undefined}>{d.name}</text>
      <text x={last ? 340 : 310} y={d.y + (last ? 23 : 24)} className="cf-band-value" textAnchor={last ? "start" : "middle"} fill={last ? "var(--cf-ink-2)" : "var(--cf-label-light)"} opacity={last ? 1 : 0.9}>{fmt(d)}</text>
     </g>; })}
    </svg>
    <div className="cf-stats">{DATA.map((d, i) => <div key={d.name} className={`cf-stat${dim(i) ? " dim" : ""}`} style={{ "--swatch": d.color } as React.CSSProperties} {...hoverProps(i)}>
     <div className="cf-headline">{d.count.toLocaleString("en-US")} <span>CVEs · {d.share.toFixed(1)}%</span></div>
     <div className={`cf-metric-line${metric === "kev" ? " is-active" : ""}`}><span className="cf-val">KEV {d.kev.toFixed(2)}%</span><span className="cf-bar-track"><span className="cf-bar-fill" style={{ width: `${(d.kev / maxOf("kev")) * 100}%` }}/></span></div>
     <div className={`cf-metric-line${metric === "sev" ? " is-active" : ""}`}><span className="cf-val">High/Crit {d.sev.toFixed(1)}%</span><span className="cf-bar-track"><span className="cf-bar-fill" style={{ width: `${(d.sev / maxOf("sev")) * 100}%` }}/></span></div>
    </div>)}</div>
   </div>
  </div>
 </div>;
}
