import Image from "next/image";
import type { ReactNode } from "react";
import { formatDate, severityInfo } from "../lib/explorer";
import type { ExplorerCve, Severity } from "../lib/types";

// Step 4 of the explorer: everything our dataset has about one CVE, plus a link to the full record.
export function CVEDetails({ cve, vendor, severity, cweNames }: { cve: ExplorerCve; vendor: string; severity: Severity; cweNames: Record<string, string> }) {
  const info = severityInfo[severity];
  const fields: [string, ReactNode][] = [
    ["Vendor", vendor],
    ["Product", cve.product || "Not listed"],
    [
      "Weakness (CWE)",
      cve.cwes.length ? (
        <span className="block space-y-0.5">
          {cve.cwes.map((cwe) => (
            <span key={cwe} className="block">{cweNames[cwe] && cweNames[cwe] !== cwe ? `${cweNames[cwe]} (${cwe})` : cwe}</span>
          ))}
        </span>
      ) : (
        "Not listed"
      ),
    ],
    ["Published", formatDate(cve.published)],
    ["Reserved", formatDate(cve.reserved)],
    ["Assigned by", cve.assigner || "Not listed"],
  ];

  return (
    <article className="grid gap-6 md:grid-cols-[11rem_1fr]">
      <div className="flex flex-col items-center text-center">
        <span className="relative block h-36 w-36">
          <Image src={info.insectImage} alt={`${info.label} severity ${info.insect}`} fill sizes="144px" className="object-contain" />
        </span>
        <span className="mt-2 text-sm font-bold">{info.label} severity</span>
        <span className="display text-4xl tabular-nums">{cve.score ?? "-"}</span>
        <span className="text-xs text-slate-500">CVSS score</span>
      </div>

      <div className="min-w-0">
        <h4 className="display text-3xl break-words">{cve.id}</h4>
        {cve.inKev ? (
          <p className="mt-3 border-l-4 border-[#c0392b] bg-[#c0392b]/10 px-3 py-2 text-sm">
            <b>Exploited in the wild.</b> CISA added this CVE to its Known Exploited Vulnerabilities catalog on {formatDate(cve.dateAddedToKev)}.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Not in CISA&apos;s Known Exploited Vulnerabilities catalog.</p>
        )}

        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="terminal-label text-[10px] text-slate-500">{label}</dt>
              <dd className="mt-0.5 break-words text-sm">{value}</dd>
            </div>
          ))}
          <div className="sm:col-span-2">
            <dt className="terminal-label text-[10px] text-slate-500">Description</dt>
            <dd className="mt-0.5 text-sm leading-6">{cve.description || "Our extract has no description for this CVE."}</dd>
          </div>
        </dl>

        <a
          href={`https://www.cve.org/CVERecord?id=${cve.id}`}
          target="_blank"
          rel="noreferrer"
          className="explorer-button mt-5 inline-block"
        >
          Open the full record on cve.org
        </a>
      </div>
    </article>
  );
}
