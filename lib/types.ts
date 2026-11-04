export type YearPoint = { year: number; cves: number; critical: number; high: number };
export type CwePoint = { cwe: string; label: string; count: number; group: string };
export type Filters = { year: number | null; severity: "all" | "critical" | "high"; cwe: string | null };
export interface CVEData {
  id: string;
  title: string;
  description: string;
  score: number;
  publishedDate: string;
  references: string[];
}

export interface VendorCVEs {
  [vendor: string]: CVEData[];
}

export interface CVEResponse {
  critical: VendorCVEs;
  high: VendorCVEs;
  medium: VendorCVEs;
  low: VendorCVEs;
}

export interface Filters {
  year: number | null;
  severity: string;
  cwe: string | null;
}
