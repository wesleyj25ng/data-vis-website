export type YearPoint = { year: number; cves: number; critical: number; high: number };
export type CwePoint = { cwe: string; label: string; count: number; group: string };
export type Filters = { year: number | null; severity: "all" | "critical" | "high"; cwe: string | null };
