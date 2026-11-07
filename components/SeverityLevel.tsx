import Image from "next/image";
import { plural, severityInfo } from "../lib/explorer";
import type { ExplorerSummary, Severity } from "../lib/types";

// Step 1 of the explorer: one habitat per CVSS severity.
export function SeverityLevel({ summary, onSelect }: { summary: ExplorerSummary; onSelect: (severity: Severity) => void }) {
  const total = summary.severities.reduce((sum, s) => sum + s.count, 0);
  return (
    <div>
      <p className="text-sm text-slate-600">
        {total.toLocaleString("en-US")} published CVEs have both a CVSS severity and a named vendor. Pick a severity to see its vendors.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {summary.severities.map((s) => {
          const info = severityInfo[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              aria-label={`${info.label} severity: ${plural(s.count, "CVE")}, ${s.kev.toLocaleString("en-US")} exploited`}
              className="explorer-tile flex flex-col items-center p-3 text-center md:p-4"
            >
              <span className="relative block aspect-square w-full max-w-56">
                <Image src={info.habitatImage} alt="" fill sizes="(min-width: 768px) 224px, 40vw" className="object-contain" />
              </span>
              <span className="mt-3 text-lg font-bold">{info.label}</span>
              <span className="text-xs text-slate-500">{info.habitat}</span>
              <span className="mt-2 text-sm tabular-nums">{plural(s.count, "CVE")}</span>
              <span className="text-xs tabular-nums text-[#c0392b]">{s.kev.toLocaleString("en-US")} exploited</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
