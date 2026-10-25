"use client";

import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import profileData from "../data/cve-profile.json";

const metrics = [
  { key: "cvssCoverage", label: "CVSS coverage", description: "Records with a CVSS score" },
  { key: "highCriticalShare", label: "High / critical", description: "Scored records rated High or Critical" },
  { key: "vendorDiversity", label: "Vendor diversity", description: "Distinct named vendors per 1,000 published CVEs, indexed to the highest yearly rate" },
  { key: "cweCoverage", label: "CWE identified", description: "Records with a CWE problem type" },
  { key: "meanCvss", label: "Mean CVSS / 10", description: "Average CVSS score, scaled to 0-100" },
] as const;

type MetricKey = (typeof metrics)[number]["key"];
type Profile = (typeof profileData.years)[number];
const highestVendorRate = Math.max(...profileData.years.map((item) => item.uniqueVendorsPer1000));
const overallVendorIndex = profileData.overall.uniqueVendorsPer1000 / highestVendorRate * 100;

function formatValue(value: number | null) {
  return value === null ? "No scored CVSS records" : `${value.toFixed(2)}%`;
}

function formatChartValue(label: string, value: number | null) {
  return label === "Vendor diversity" && value !== null
    ? `${value.toFixed(2)} index points`
    : formatValue(value);
}

function ProfileTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      selected: number | null;
      overall: number | null;
      selectedVendorRate: number;
      overallVendorRate: number;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const metric = metrics.find((item) => item.label === point.label);
  return (
    <div className="max-w-64 border border-[#071a2b] bg-white p-3 text-xs shadow-[3px_3px_0_#071a2b]">
      <p className="font-bold">{point.label}</p>
      <p className="mt-1">Selected year: <b>{formatChartValue(point.label, point.selected)}</b></p>
      <p>All years: <b>{formatChartValue(point.label, point.overall)}</b></p>
      {point.label === "Vendor diversity" && (
        <>
          <p>Selected year: <b>{point.selectedVendorRate.toFixed(2)} vendors / 1,000 CVEs</b></p>
          <p>All-years baseline: <b>{point.overallVendorRate.toFixed(2)} vendors / 1,000 CVEs</b></p>
        </>
      )}
      {metric && <p className="mt-1 text-slate-600">{metric.description}</p>}
    </div>
  );
}

export function CveSpiderChart() {
  const [year, setYear] = useState(profileData.years[profileData.years.length - 1].year);
  const [showOverall, setShowOverall] = useState(true);
  const profile = profileData.years.find((item) => item.year === year) as Profile;
  const data = metrics.map((metric) => ({
    label: metric.label,
    selected: metric.key === "vendorDiversity"
      ? profile.uniqueVendorsPer1000 / highestVendorRate * 100
      : profile[metric.key as Exclude<MetricKey, "vendorDiversity">],
    overall: metric.key === "vendorDiversity"
      ? overallVendorIndex
      : profileData.overall[metric.key as Exclude<MetricKey, "vendorDiversity">],
    selectedVendorRate: profile.uniqueVendorsPer1000,
    overallVendorRate: profileData.overall.uniqueVendorsPer1000,
  }));
  const years = profileData.years;

  return (
    <div className="chart-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[#137cbe]">Data-backed profile · published CVEs</p>
          <h3 className="display mt-1 text-3xl">The shape of vulnerability risk</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Compare coverage, severity, and vendor diversity for a publication year. The vendor-diversity spoke is indexed to the highest yearly rate; hover to see vendors per 1,000 CVEs.
          </p>
        </div>
        <label className="min-w-48 text-sm font-bold">
          <span className="terminal-label block text-[10px] text-[#137cbe]">Publication year</span>
          <span className="mt-1 block text-xl">{year}</span>
          <input
            aria-label="Select publication year"
            className="mt-2 w-full accent-[#137cbe]"
            type="range"
            min={years[0].year}
            max={years[years.length - 1].year}
            step="1"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          />
          <span className="flex justify-between text-xs font-normal text-slate-500">
            <span>{years[0].year}</span>
            <span>{years[years.length - 1].year}</span>
          </span>
        </label>
      </div>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm">
        <input
          checked={showOverall}
          className="accent-[#137cbe]"
          onChange={(event) => setShowOverall(event.target.checked)}
          type="checkbox"
        />
        <span>Compare with all years</span>
      </label>
      <div className="h-[22rem] w-full md:h-[27rem]">
        <ResponsiveContainer>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(7,26,43,.2)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#071a2b", fontSize: 12, fontWeight: 700 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#49616e", fontSize: 10 }} tickCount={5} />
            <Tooltip content={<ProfileTooltip />} />
            {showOverall && (
              <Radar
                name="All years"
                dataKey="overall"
                stroke="#f0aa48"
                strokeDasharray="5 4"
                strokeWidth={2}
                fill="#f0aa48"
                fillOpacity={0.12}
              />
            )}
            <Radar
              name={`${year}`}
              dataKey="selected"
              stroke="#137cbe"
              strokeWidth={3}
              fill="#27b6ff"
              fillOpacity={0.35}
              activeDot={{ r: 5, fill: "#c7f464", stroke: "#071a2b" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#071a2b]/15 pt-3 text-xs">
        <span><i className="mr-2 inline-block h-2 w-5 bg-[#137cbe]" />{year}</span>
        {showOverall && <span><i className="mr-2 inline-block h-2 w-5 border-t-2 border-dashed border-[#f0aa48]" />All years</span>}
        <span className="text-slate-500">
          {profile.records.toLocaleString()} published records · {profile.scoredRecords.toLocaleString()} with CVSS scores · {profile.uniqueVendors.toLocaleString()} unique named vendors
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        CVSS coverage and CWE identification use all included records; high/critical share and mean CVSS use scored records. Vendor diversity is indexed against the highest yearly vendor rate; hover for the actual rate.
      </p>
    </div>
  );
}
