"use client";

import { useState } from "react";
import { AnnualTrendChart } from "../components/AnnualTrendChart";
import { CVEExplorer } from "../components/CVEExplorer";
import { CveSpiderChart } from "../components/CveSpiderChart";
import { CweSeverityHeatmap } from "../components/CweSeverityHeatmap";
import { SectionHeader } from "../components/SectionHeader";
import { VendorExploitationChart } from "../components/VendorExploitationChart";
import type { Filters } from "../lib/types";

// The numbers match the section headers below.
const nav = [
  ["", "Intro", "introduction"],
  ["01", "Trends", "trends"],
  ["02", "Patterns", "patterns"],
  ["03", "Severity", "severity"],
  ["04", "Explorer", "explorer"],
  ["05", "Notes", "notes"],
] as const;

const sources = [
  ["CVE List V5", "https://github.com/CVEProject/cvelistV5", "every CVE record, with its CVSS score, CWE and vendor"],
  ["CISA Known Exploited Vulnerabilities catalog", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "which CVEs have been exploited"],
  ["CVE Program", "https://www.cve.org", "definitions of CVE records, CNAs and record states"],
  ["CWE list (MITRE)", "https://cwe.mitre.org", "names of the weakness types"],
  ["CVSS (FIRST)", "https://www.first.org/cvss/", "how severity scores and ratings are defined"],
] as const;

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ year: null, cwe: null });

  const activeFilters: string[] = [];
  if (filters.year !== null) activeFilters.push(`Year ${filters.year}`);
  if (filters.cwe) activeFilters.push(filters.cwe);

  return (
    <main>
      <nav className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#27b6ff]/30 bg-[#071a2b]/95 px-5 py-3 text-white backdrop-blur md:px-8">
        <a href="#introduction" className="display shrink-0 text-xl font-bold">
          CVE <i className="text-[#c7f464]">Atlas</i>
        </a>
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto whitespace-nowrap lg:justify-center">
          {nav.map(([number, label, id]) => (
            <a className="eyebrow py-1 text-white/65 hover:text-[#c7f464]" href={`#${id}`} key={id}>
              {number && `${number} `}{label}
            </a>
          ))}
        </div>
        <span className="eyebrow hidden shrink-0 border border-[#c7f464]/50 px-3 py-1 text-[#c7f464] md:inline">
          GT CS 6730 · 2026
        </span>
      </nav>

      <section id="introduction" className="grid-paper relative min-h-[88vh] overflow-hidden px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow mb-5 text-[#137cbe]">An interactive data story about disclosed software vulnerabilities</p>
          <h1 className="display max-w-5xl text-[2.5rem] leading-[.86] sm:text-6xl md:text-8xl lg:text-9xl">
            CVEs: profiling software vulnerabilities <span className="text-[#137cbe]">over the years.</span>
          </h1>
          <div className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <p className="text-lg leading-7">
              Every CVE is a public record of a software vulnerability. This story looks at how many are published each year, how severe they
              are, what kinds of weaknesses cause them, and which ones attackers actually exploit.
            </p>
            <p className="border-l-2 border-[#137cbe] pl-5 text-sm leading-6 text-slate-600">
              Written for software developers. All charts use our cleaned dataset: 395,208 published CVE records from the CVE List, up to
              Oct 24, 2026, matched with CISA&apos;s catalog of exploited vulnerabilities.
            </p>
          </div>
          <div className="mt-16 flex flex-wrap gap-3">
            <a href="#trends" className="bg-[#071a2b] px-5 py-3 text-sm font-bold text-white hover:bg-[#137cbe]">
              Start the story ↓
            </a>
            <a href="#notes" className="border border-[#071a2b]/30 px-5 py-3 text-sm font-bold hover:bg-white">
              Findings, data &amp; limitations
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 hidden h-44 w-44 bg-[#c7f464] md:block" />
      </section>

      <section className="bg-[#071a2b] px-5 py-12 text-white md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.25fr_2fr]">
          <p className="eyebrow text-[#c7f464]">A vocabulary for the story</p>
          <p className="text-xl leading-8 text-slate-200">
            A <b className="text-white">CVE</b> identifies a publicly known vulnerability. <b className="text-white">CVSS</b> rates how severe it
            is, from Low to Critical. A <b className="text-white">CWE</b> names the underlying weakness type, like SQL injection.{" "}
            <b className="text-white">KEV</b> is CISA&apos;s list of CVEs known to be exploited in real attacks.
          </p>
        </div>
      </section>

      <section id="trends" className="section-rule scroll-mt-14 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader index="01" kicker="The volume question" title="A record can grow before risk does." />
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <AnnualTrendChart filters={filters} setFilters={setFilters} />
            <aside className="border-l-2 border-[#137cbe] pl-5 pt-5">
              <p className="eyebrow text-[#137cbe]">Read the chart</p>
              <p className="mt-3 leading-7">
                Click a year to select it. The spider chart and the CWE heatmap further down switch to that year, and the selection shows in a
                bar at the bottom of the screen. Click the same year again to clear it.
              </p>
              <p className="mt-6 text-sm text-slate-600">
                A rising record count may reflect reporting practice, coverage, or ecosystem growth. On its own it does not show that software is
                getting less secure.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section id="patterns" className="section-rule scroll-mt-14 bg-[#dce9ef] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader index="02" kicker="Comparing the records" title="A year's risk profile, and who actually gets exploited." />
          <CveSpiderChart year={filters.year} setYear={(year) => setFilters({ ...filters, year })} />
          <div className="mt-8">
            <VendorExploitationChart selectedCwe={filters.cwe} setSelectedCwe={(cwe) => setFilters({ ...filters, cwe })} />
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600">
            Both charts summarize our cleaned CVE dataset. Many records have no CVSS score, CWE or vendor, so read them alongside the coverage
            spokes of the spider chart.
          </p>
        </div>
      </section>

      <section id="severity" className="section-rule scroll-mt-14 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader index="03" kicker="Severity by weakness" title="The most common weaknesses carry very different severity." />
          <p className="mb-8 max-w-3xl border-l-2 border-[#137cbe] pl-5 leading-7">
            Weaknesses in how software handles input, like injection, path traversal and missing input validation, make up 41% of CVEs with a
            known CWE. They make up 51% of the Critical ones.
          </p>
          <CweSeverityHeatmap
            year={filters.year}
            clearYear={() => setFilters({ ...filters, year: null })}
            selectedCwe={filters.cwe}
            setSelectedCwe={(cwe) => setFilters({ ...filters, cwe })}
          />
        </div>
      </section>

      <section id="explorer" className="section-rule scroll-mt-14 bg-[#dce9ef] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader index="04" kicker="Interactive exploration" title="Drill into vulnerabilities by severity and vendor." />
          <CVEExplorer />
        </div>
      </section>

      <section id="notes" className="scroll-mt-14 bg-[#071a2b] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-[#c7f464]">05 · Conclusions</p>
          <h2 className="display mt-3 max-w-3xl text-5xl">What we found, and what the data cannot say.</h2>

          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              [
                "Volume keeps climbing.",
                "6,457 CVEs were published in 2016 and 48,151 in 2025. 2026 already has 86,330 by October 24.",
              ],
              [
                "The most common weakness is not the most severe.",
                "Cross-site scripting (CWE-79) is the most common weakness, but 71% of its scored CVEs are Medium. SQL injection, OS command injection and code injection have the most Critical CVEs.",
              ],
              [
                "Input handling matters most.",
                "Weaknesses in how software handles input are 41% of CVEs with a known CWE, but 51% of the Critical ones and 43% of the exploited ones.",
              ],
              [
                "More CVEs doesn't mean more exploitation.",
                "Only 1,756 of 395,208 published CVEs (about 1 in 225) are in CISA's KEV catalog. Linux has the most CVEs, but Microsoft has the most exploited ones.",
              ],
            ].map(([title, text], i) => (
              <li key={title} className="border-t border-white/20 pt-4">
                <span className="eyebrow text-[#c7f464]">Finding {i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-10 text-sm leading-6 text-slate-300 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 font-bold text-white">For developers</h3>
              <p>
                Treat every input that reaches a database query, a shell command, a file path or an interpreter as untrusted, and validate it.
                When deciding what to patch first, put CVEs in the KEV catalog ahead of a high CVSS score alone.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-bold text-white">What the data cannot say</h3>
              <p>
                55% of published CVEs have no CVSS severity, 46% have no CWE and 43% list no vendor, mostly older records. KEV only lists
                exploitation CISA has confirmed, so it undercounts. A CVE with two CWEs counts under both, and 2026 is a partial year.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-bold text-white">How we built it</h3>
              <p>
                We cleaned the CVE List into one row per CVE and matched it with the KEV catalog. Python scripts turn that file into small JSON
                files for each chart, and the site is built with Next.js, Recharts and D3. Vendor name variants are merged, and years come from
                the publication date.
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="mb-2 font-bold text-white">Sources</h3>
              <ul className="space-y-1">
                {sources.map(([name, url, use]) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="font-bold text-[#c7f464] underline-offset-2 hover:underline">
                      {name}
                    </a>
                    <span>: {use}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-bold text-white">Team</h3>
              <p>
                Can Visualize Everything: Abhinav Shaurya Agarwal, Arkishman Ghosh, Wesley Jeong, Robert Caleb Jones and Brian Yang. CS 6730, Georgia
                Tech, Fall 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {activeFilters.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-4 border border-[#071a2b] bg-[#c7f464] px-4 py-3 text-sm font-bold shadow-[4px_4px_0_#071a2b]">
          <span>Linked selection: {activeFilters.join(" · ")}</span>
          <button
            type="button"
            onClick={() => setFilters({ year: null, cwe: null })}
            className="underline underline-offset-2 hover:no-underline"
            aria-label="Clear the linked selection"
          >
            Clear
          </button>
        </div>
      )}
    </main>
  );
}
