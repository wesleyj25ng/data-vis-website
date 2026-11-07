import Image from "next/image";
import { useMemo, useState } from "react";
import { plural, severityInfo } from "../lib/explorer";
import type { ExplorerSummary, ExplorerVendor } from "../lib/types";

const PAGE_SIZE = 20;

type SeveritySummary = ExplorerSummary["severities"][number];

// Step 2 of the explorer: the vendors with the most CVEs at the chosen severity, with a search box.
export function VendorSelector({ severity, minCves, onSelect }: { severity: SeveritySummary; minCves: number; onSelect: (vendor: ExplorerVendor) => void }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const info = severityInfo[severity.key];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? severity.vendors.filter(([name]) => name.toLowerCase().includes(q)) : severity.vendors;
  }, [query, severity.vendors]);
  const shown = matches.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{info.label} CVEs by vendor</p>
          <p className="text-sm text-slate-600">
            {severity.vendors.length.toLocaleString("en-US")} vendors have at least {minCves} {info.label} CVEs
            (out of {severity.vendorCount.toLocaleString("en-US")} vendors with any). Biggest first.
          </p>
        </div>
        <label className="text-sm font-bold">
          <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">Find a vendor</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="e.g. Microsoft"
            className="w-60 border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-600">
          No vendor matching &quot;{query}&quot; has {minCves} or more {info.label} CVEs.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((vendor) => {
            const [name, key, count, kev] = vendor;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(vendor)}
                aria-label={`${name}: ${plural(count, "CVE")}${kev ? `, ${kev} exploited` : ""}`}
                className="explorer-tile flex flex-col items-center p-3 text-center"
              >
                <span className="relative block h-20 w-20">
                  <Image src={info.habitatImage} alt="" fill sizes="80px" className="object-contain" />
                </span>
                <span className="mt-2 line-clamp-2 text-sm font-bold">{name}</span>
                <span className="text-xs tabular-nums text-slate-600">{plural(count, "CVE")}</span>
                {kev > 0 && <span className="text-xs tabular-nums text-[#c0392b]">{kev} exploited</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
        <span>Showing {shown.length.toLocaleString("en-US")} of {matches.length.toLocaleString("en-US")}</span>
        {visible < matches.length && (
          <button type="button" className="explorer-button" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show {Math.min(PAGE_SIZE, matches.length - visible)} more vendors
          </button>
        )}
      </div>
    </div>
  );
}
