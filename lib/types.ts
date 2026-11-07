// Shared state for the linked charts: the year picked in the trend chart (or spider chart slider)
// and the weakness picked in the vendor chart or heatmap.
export type Filters = { year: number | null; cwe: string | null };

// Explorer (see scripts/build-explorer-data.py)
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// [name, file key, CVE count, CVEs in KEV]
export type ExplorerVendor = [string, string, number, number];

export type ExplorerSummary = {
  minCves: number;
  severities: { key: Severity; count: number; kev: number; vendorCount: number; vendors: ExplorerVendor[] }[];
  cweNames: Record<string, string>;
};

// One CVE as stored in public/explorer/<severity>/<vendor>.json
export type ExplorerCveRow = [
  id: string,
  product: string,
  score: number | null,
  published: string,
  reserved: string,
  cwes: string[],
  inKev: 0 | 1,
  dateAddedToKev: string,
  assigner: string,
  description: string,
];

export type ExplorerCve = {
  id: string;
  product: string;
  score: number | null;
  published: string;
  reserved: string;
  cwes: string[];
  inKev: boolean;
  dateAddedToKev: string;
  assigner: string;
  description: string;
};

export function toExplorerCve(row: ExplorerCveRow): ExplorerCve {
  const [id, product, score, published, reserved, cwes, inKev, dateAddedToKev, assigner, description] = row;
  return { id, product, score, published, reserved, cwes, inKev: inKev === 1, dateAddedToKev, assigner, description };
}
