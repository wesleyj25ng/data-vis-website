"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import annualData from "../data/cve-annual-trend.json";
import { Filters } from "../lib/types";

type TrendRecord = [number, number, number, number, number];

const severityLabels: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "None",
  UNSCORED: "Unscored",
};

export function AnnualTrendChart({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) {
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [assigner, setAssigner] = useState("all");
  const [assignerSearch, setAssignerSearch] = useState("");

  const matchingAssigners = useMemo(() => {
    const query = assignerSearch.trim().toLocaleLowerCase();
    if (!query) return annualData.assigners;
    return annualData.assigners.filter((name) => name.toLocaleLowerCase().includes(query));
  }, [assignerSearch]);

  const chartData = useMemo(() => {
    const totals = new Map<number, number>();
    for (const [yearIndex, statusIndex, severityIndex, assignerIndex, count] of annualData.records as TrendRecord[]) {
      const rowStatus = annualData.statuses[statusIndex];
      const rowSeverity = annualData.severities[severityIndex];
      const rowAssigner = annualData.assigners[assignerIndex];
      if (status !== "all" && rowStatus !== status) continue;
      if (severity !== "all" && rowSeverity !== severity) continue;
      if (assigner !== "all" && rowAssigner !== assigner) continue;

      const year = annualData.years[yearIndex];
      totals.set(year, (totals.get(year) ?? 0) + count);
    }
    return annualData.years.map((year) => ({ year, cves: totals.get(year) ?? 0 }));
  }, [assigner, severity, status]);

  const totalMatching = chartData.reduce((total, point) => total + point.cves, 0);

  function resetFilters() {
    setSeverity("all");
    setStatus("all");
    setAssigner("all");
    setAssignerSearch("");
    setFilters({ ...filters, year: null });
  }

  return (
    <div className="chart-card p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[#137cbe]">CVE List · dated records</p>
          <h3 className="display mt-1 text-3xl">CVE records by year</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Filter the annual count by CVSS severity, record status, and CNA assigner.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="terminal-label text-[10px] text-[#137cbe]">● interactive</span>
          <button
            onClick={resetFilters}
            className="border border-[#071a2b]/25 px-3 py-2 text-xs font-bold hover:bg-[#c7f464]"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm font-bold">
          <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">CVSS severity</span>
          <select
            className="w-full border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="all">All severities</option>
            {annualData.severities.map((value) => (
              <option key={value} value={value}>{severityLabels[value] ?? value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">Record status</span>
          <select
            className="w-full border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {annualData.statuses.map((value) => (
              <option key={value} value={value}>{value[0] + value.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <div className="text-sm font-bold">
          <label className="block" htmlFor="assigner-search">
            <span className="terminal-label mb-1 block text-[10px] text-[#137cbe]">Find assigner</span>
          </label>
          <input
            id="assigner-search"
            className="mb-2 w-full border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            type="search"
            placeholder="Search assigners"
            value={assignerSearch}
            onChange={(event) => setAssignerSearch(event.target.value)}
          />
          <label className="sr-only" htmlFor="assigner-select">Select assigner</label>
          <select
            id="assigner-select"
            className="w-full border border-[#071a2b]/25 bg-white px-3 py-2 font-normal"
            value={assigner}
            onChange={(event) => setAssigner(event.target.value)}
          >
            <option value="all">All assigners</option>
            {assigner !== "all" && !matchingAssigners.includes(assigner) && (
              <option value={assigner}>{assigner}</option>
            )}
            {matchingAssigners.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            onClick={(event) => {
              const year = event?.activeLabel;
              if (year) setFilters({ ...filters, year: Number(year) });
            }}
            margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis
              allowDecimals={false}
              tickFormatter={(value: number) => value >= 1000 ? `${value / 1000}k` : String(value)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "CVE records"]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            {filters.year && <ReferenceLine x={filters.year} stroke="#f0aa48" strokeDasharray="4 4" />}
            <Line
              type="monotone"
              dataKey="cves"
              name="CVE records"
              stroke="#137cbe"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#c7f464", stroke: "#071a2b" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#071a2b]/15 pt-3">
        <p className="terminal-label text-[10px] text-slate-500">
          {totalMatching.toLocaleString()} records across displayed years · select a year to link it to other views
        </p>
        {filters.year && (
          <p className="text-xs font-bold">Selected year: {filters.year}</p>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Uses Date Published for both statuses. Rejected CVEs without a publication date ({annualData.excludedUndatedRecords.toLocaleString()} records) cannot be assigned to a year and are excluded. Unscored records are available as a severity option; 2026 is partial in this extract.
      </p>
    </div>
  );
}
