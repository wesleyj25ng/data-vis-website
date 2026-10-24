import { CwePoint, YearPoint } from "./types";

// ILLUSTRATIVE ONLY — replace these values with local cleaned source data before analysis.
export const annualSample: YearPoint[] = [
  { year: 2018, cves: 16556, critical: 402, high: 3120 },
  { year: 2019, cves: 17306, critical: 470, high: 3370 },
  { year: 2020, cves: 18325, critical: 520, high: 3700 },
  { year: 2021, cves: 20175, critical: 610, high: 4100 },
  { year: 2022, cves: 25103, critical: 790, high: 5100 },
  { year: 2023, cves: 28756, critical: 850, high: 5800 },
  { year: 2024, cves: 40512, critical: 1100, high: 7600 },
];

export const cweSample: CwePoint[] = [
  { cwe: "CWE-79", label: "Cross-site scripting", count: 1240, group: "Web" },
  { cwe: "CWE-89", label: "SQL injection", count: 810, group: "Web" },
  { cwe: "CWE-787", label: "Out-of-bounds write", count: 730, group: "Memory" },
  { cwe: "CWE-125", label: "Out-of-bounds read", count: 610, group: "Memory" },
  { cwe: "CWE-416", label: "Use after free", count: 455, group: "Memory" },
  { cwe: "CWE-20", label: "Improper input validation", count: 920, group: "Validation" },
];

export const severitySample = [
  { name: "Low", value: 14, color: "#9bb8c5" }, { name: "Medium", value: 36, color: "#4b91bb" },
  { name: "High", value: 38, color: "#f0aa48" }, { name: "Critical", value: 12, color: "#d65245" },
];
