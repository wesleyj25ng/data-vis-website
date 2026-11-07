import type { Severity } from "./types";

// The explorer's metaphor: each severity is a habitat, and each CVE is one insect living in it.
export const severityInfo: Record<Severity, { label: string; habitat: string; insect: string; habitatImage: string; insectImage: string }> = {
  CRITICAL: { label: "Critical", habitat: "Yellow jacket nest", insect: "yellow jacket", habitatImage: "/images/yellow_jacket_nest.png", insectImage: "/images/yellow_jacket.png" },
  HIGH: { label: "High", habitat: "Beehive", insect: "bee", habitatImage: "/images/beehive.png", insectImage: "/images/bee.png" },
  MEDIUM: { label: "Medium", habitat: "Anthill", insect: "ant", habitatImage: "/images/anthill.png", insectImage: "/images/ant.png" },
  LOW: { label: "Low", habitat: "Grass", insect: "ladybug", habitatImage: "/images/grass.png", insectImage: "/images/ladybug.png" },
};

// Dates are stored as YYYY-MM-DD; format them in UTC so they never shift by a day.
export function formatDate(value: string) {
  if (!value) return "Not listed";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function plural(n: number, word: string) {
  return `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
}
