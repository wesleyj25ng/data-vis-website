"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { formatDate, plural, severityInfo } from "../lib/explorer";
import type { ExplorerCve, ExplorerVendor, Severity } from "../lib/types";

// Step 3 of the explorer: one insect per CVE, grouped by publication year (newest on the left).
// The map opens zoomed out so every year fits, which doubles as an overview of the vendor's CVEs per year.
// It can be dragged, and zoomed with the buttons, a pinch, or Ctrl + scroll.

function ZoomControls({ viewport, world, onFitted }: { viewport: RefObject<HTMLDivElement | null>; world: RefObject<HTMLDivElement | null>; onFitted: () => void }) {
  const { zoomIn, zoomOut, centerView } = useControls();
  const [fit, setFit] = useState(1);

  // Runs once when the map opens (the map is rebuilt for each vendor). Waits a frame so the zoom library is set up.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const v = viewport.current;
      const w = world.current;
      if (!v || !w) return;
      const scale = Math.min(1, v.clientWidth / w.offsetWidth, v.clientHeight / w.offsetHeight);
      setFit(scale);
      centerView(scale, 0);
      onFitted();
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex gap-1.5">
      <button type="button" className="explorer-button px-3" onClick={() => zoomIn()} aria-label="Zoom in">+</button>
      <button type="button" className="explorer-button px-3" onClick={() => zoomOut()} aria-label="Zoom out">-</button>
      <button type="button" className="explorer-button" onClick={() => centerView(fit)}>Show all years</button>
    </div>
  );
}

// Wider clusters for busy years, so a year with thousands of CVEs is not one very tall column.
function columnsFor(n: number) {
  return Math.min(40, Math.max(5, Math.ceil(Math.sqrt(n / 1.5))));
}

export function CVEYearMap({ cves, vendor, severity, onSelect }: { cves: ExplorerCve[]; vendor: ExplorerVendor; severity: Severity; onSelect: (cve: ExplorerCve) => void }) {
  const [preview, setPreview] = useState<ExplorerCve | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const [fitted, setFitted] = useState(false);
  const info = severityInfo[severity];
  const exploited = cves.filter((c) => c.inKev).length;

  const years = useMemo(() => {
    const groups = new Map<string, ExplorerCve[]>();
    for (const cve of cves) {
      const year = cve.published.slice(0, 4) || "Unknown";
      const list = groups.get(year);
      if (list) list.push(cve);
      else groups.set(year, [cve]);
    }
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [cves]);

  return (
    <div>
      <p className="text-lg font-bold">{vendor[0]}: {plural(cves.length, `${info.label} CVE`)}</p>
      <p className="text-sm text-slate-600">
        {exploited > 0 ? `${exploited.toLocaleString("en-US")} of them exploited (red ring). ` : "None of them are in CISA's KEV catalog. "}
        Each {info.insect} is one CVE, grouped by the year it was published. Zoom in and click one to open it.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={info.insectImage} alt="" width={22} height={22} /> One CVE
          </span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-4 w-4 rounded-full border-2 border-[#c0392b]" /> Exploited (in KEV)</span>
          <span>Drag to move. Zoom with the buttons, a pinch, or Ctrl + scroll.</span>
        </div>
        <TransformWrapper initialScale={1} minScale={0.02} maxScale={4} centerZoomedOut limitToBounds wheel={{ activationKeys: ["Control"] }} doubleClick={{ disabled: true }}>
          {() => (
            <>
              <ZoomControls viewport={viewport} world={world} onFitted={() => setFitted(true)} />
              <div ref={viewport} className="cve-map mt-1 w-full basis-full" style={{ visibility: fitted ? "visible" : "hidden" }}>
                <TransformComponent wrapperClass="cve-map-viewport" contentClass="cve-map-content">
                  <div ref={world} className="cve-map-world">
                    {years.map(([year, list]) => (
                      <section className="cve-year-cluster" key={year}>
                        <h4 className="cve-year-heading">
                          {year} <span>({list.length.toLocaleString("en-US")})</span>
                        </h4>
                        <div className="cve-year-icons" style={{ gridTemplateColumns: `repeat(${columnsFor(list.length)}, 40px)` }}>
                          {list.map((cve) => (
                            <button
                              type="button"
                              key={cve.id}
                              className={`cve-map-icon${cve.inKev ? " is-exploited" : ""}`}
                              onClick={() => onSelect(cve)}
                              onMouseEnter={() => setPreview(cve)}
                              onFocus={() => setPreview(cve)}
                              aria-label={`${cve.id}, ${cve.product || "product not listed"}, CVSS ${cve.score ?? "not listed"}${cve.inKev ? ", exploited" : ""}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={info.insectImage} alt="" width={34} height={34} decoding="async" draggable={false} />
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      <p className="mt-3 min-h-10 border-l-2 border-[#137cbe] pl-3 text-sm" aria-live="polite">
        {preview ? (
          <>
            <b>{preview.id}</b> · {preview.product || "Product not listed"} · CVSS {preview.score ?? "not listed"} · published {formatDate(preview.published)}
            {preview.inKev && <b className="text-[#c0392b]"> · exploited</b>}
          </>
        ) : (
          <span className="text-slate-500">Hover an insect to preview a CVE here.</span>
        )}
      </p>
    </div>
  );
}
