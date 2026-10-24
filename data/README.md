# Local data contract

Caleb's cleaned record-level source dataset is shared separately from this repository. It is intentionally not loaded by the prototype yet: the site uses clearly labeled samples from `lib/sample-data.ts` while visualization work is distributed across the team.

Add derived, analysis-ready aggregates here when a chart owner is ready to connect a real view. Keep the record-level source separate from these smaller chart-ready files.

Suggested annual CSV columns: `year,cves,critical,high`.
Suggested CWE JSON/CSV columns: `cwe,label,count,group`.

Keep raw source data out of this folder if it is too large to submit. Document the source URL, retrieval date, cleaning scripts, aggregation rules, and known gaps in the process book.
