// Terms used across the site. The Glossary section lists all of them, and <Term> links a word in the
// story text to its entry (hovering shows the short definition).

export type GlossaryEntry = {
  id: string;
  term: string;
  short: string; // one line, shown on hover
  long?: string; // extra detail, shown in the Glossary section
};

export type GlossaryGroup = { title: string; entries: GlossaryEntry[] };

export const glossary: GlossaryGroup[] = [
  {
    title: "Vulnerability records",
    entries: [
      {
        id: "cve",
        term: "CVE (Common Vulnerabilities and Exposures)",
        short: "A public ID, like CVE-2021-44228, for one specific software vulnerability.",
        long: "It gives everyone, from vendors to security tools, one shared name for the same bug.",
      },
      {
        id: "cve-record",
        term: "CVE record",
        short: "The entry for one CVE: its description, affected vendor and product, dates, and often a CVSS score and a CWE.",
      },
      {
        id: "cve-list",
        term: "CVE List",
        short: "The official collection of all CVE records, published by the CVE Program at cve.org.",
        long: "Our data comes from its V5 release on GitHub.",
      },
      {
        id: "cna",
        term: "CNA (CVE Numbering Authority)",
        short: "An organization allowed to assign CVE IDs and publish CVE records, often for its own products.",
        long: "Examples are Microsoft, Google and GitHub. The trend chart calls it the assigner.",
      },
      {
        id: "record-state",
        term: "Published and rejected",
        short: "A published record is an active CVE. A rejected one was withdrawn, for example as a duplicate or because it was not a real vulnerability.",
        long: "Our charts use published records unless they say otherwise.",
      },
      {
        id: "vendor",
        term: "Vendor and product",
        short: "The company or project that makes the affected software, and the software itself, as listed in the CVE record.",
        long: "We merged spelling variants of the same vendor, like Microsoft and Microsoft Corporation. 43% of published CVEs list no vendor.",
      },
      {
        id: "dates",
        term: "Date reserved and date published",
        short: "When the CVE ID was set aside, and when the record was made public. Years in our charts come from the publication date.",
      },
    ],
  },
  {
    title: "Severity",
    entries: [
      {
        id: "cvss",
        term: "CVSS (Common Vulnerability Scoring System)",
        short: "A standard score from 0 to 10 for how severe a vulnerability is. Higher is worse.",
        long: "It is maintained by FIRST and looks at things like how easy the bug is to attack and how much damage it can do.",
      },
      {
        id: "severity",
        term: "Severity rating",
        short: "CVSS scores grouped into levels: Low 0.1 to 3.9, Medium 4.0 to 6.9, High 7.0 to 8.9, Critical 9.0 to 10.0.",
      },
      {
        id: "unscored",
        term: "Unscored",
        short: "A CVE record with no CVSS score. About 55% of published CVEs in our data, mostly older ones.",
        long: "Many of them are scored in other databases, such as the National Vulnerability Database, which our dataset does not include.",
      },
    ],
  },
  {
    title: "Weaknesses",
    entries: [
      {
        id: "cwe",
        term: "CWE (Common Weakness Enumeration)",
        short: "A catalog of weakness types, the kinds of coding or design mistakes that cause vulnerabilities. Each has an ID like CWE-79.",
        long: "It is maintained by MITRE. A CVE can list one or more CWEs, and 46% of published CVEs list none.",
      },
      {
        id: "input-handling",
        term: "Input-handling weakness",
        short: "Our name for weaknesses where software trusts input it should not, like injection, cross-site scripting, path traversal and missing input validation.",
        long: "The group covers 56 CWEs, listed in scripts/cve_labels.py.",
      },
      {
        id: "injection",
        term: "Injection",
        short: "Untrusted input ends up being run as part of a command or query.",
        long: "SQL injection (CWE-89) changes a database query, OS command injection (CWE-78) runs commands on the server, and code injection (CWE-94) runs program code.",
      },
      {
        id: "xss",
        term: "Cross-site scripting, XSS (CWE-79)",
        short: "A website puts attacker-controlled input into a page, so the attacker's script runs in other visitors' browsers.",
      },
      {
        id: "path-traversal",
        term: "Path traversal (CWE-22)",
        short: "Input like ../ lets an attacker reach files outside the folder the program meant to use.",
      },
      {
        id: "memory",
        term: "Out-of-bounds write and use after free (CWE-787, CWE-416)",
        short: "Memory safety bugs: the program writes past the memory it owns, or keeps using memory after freeing it. Attackers can use them to crash a program or run their own code.",
      },
      {
        id: "deserialization",
        term: "Deserialization of untrusted data (CWE-502)",
        short: "A program rebuilds objects from data an attacker sent, which can let the attacker run code.",
      },
    ],
  },
  {
    title: "Exploitation",
    entries: [
      {
        id: "exploited",
        term: "Exploited in the wild",
        short: "Attackers have used the vulnerability in real attacks, not just in a test or a proof of concept.",
      },
      {
        id: "kev",
        term: "KEV (Known Exploited Vulnerabilities catalog)",
        short: "CISA's list of CVEs with reliable evidence of being exploited in the wild.",
        long: "US federal agencies must fix these by a deadline. 1,756 of the published CVEs in our data are in it. It only lists exploitation CISA has confirmed, so it undercounts.",
      },
      {
        id: "cisa",
        term: "CISA",
        short: "The Cybersecurity and Infrastructure Security Agency, the US government agency that publishes the KEV catalog.",
      },
      {
        id: "one-in-n",
        term: "1 in N",
        short: "How the vendor chart shows the share exploited: 1 in 45 means about one of every 45 of a vendor's CVEs is in KEV.",
        long: "Across all published CVEs it is about 1 in 225.",
      },
    ],
  },
  {
    title: "Reading the charts",
    entries: [
      {
        id: "linked-selection",
        term: "Linked selection",
        short: "A year or weakness you pick in one chart is shared with the others. It shows in the bar at the bottom right, with a Clear button.",
      },
      {
        id: "share-shading",
        term: "Share shading",
        short: "In the heatmap, shading each cell by its share of that weakness's scored CVEs instead of by raw count, so small and large rows can be compared.",
      },
    ],
  },
];

const byId = new Map(glossary.flatMap((group) => group.entries).map((entry) => [entry.id, entry]));

export function glossaryEntry(id: string) {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Unknown glossary term: ${id}`);
  return entry;
}
