export type YearPoint = { year: number; cves: number; critical: number; high: number };
export type CwePoint = { cwe: string; label: string; count: number; group: string };
export type Filters = { year: number | null; severity: "all" | "critical" | "high"; cwe: string | null };


export interface CVEData {  'CVE ID': string;  'Assigner Short Name': string;  'CNA ID': string;  Product: string;  Vendor: string;  State: string;  'Date Reserved': string;  'Date Published': string;  'Date Rejected': string;  'CVSS Version': string;  'CVSS Score': string;  'CVSS Severity': string;  'CVE Problem Types': string;  'Is in KEV': string;  'Date Added to KEV': string;}

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
