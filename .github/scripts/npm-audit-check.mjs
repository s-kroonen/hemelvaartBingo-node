// Fails when `npm audit` reports a high or critical advisory that is not in
// .github/audit-allowlist.json, or when an allowlist entry is past its review date.
// Plain `npm audit --audit-level=high` can't accept known, reviewed advisories.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BLOCKING = new Set(['high', 'critical']);
const allowlist = JSON.parse(
  readFileSync(new URL('../audit-allowlist.json', import.meta.url), 'utf8'),
).advisories;

const today = new Date().toISOString().slice(0, 10);
const expired = allowlist.filter((entry) => entry.reviewBy < today);

let raw;
try {
  raw = execFileSync('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
} catch (error) {
  // npm audit exits non-zero whenever it finds anything; the JSON is still on stdout.
  raw = error.stdout;
}
const { vulnerabilities = {} } = JSON.parse(raw);

// Each vulnerable package lists advisories directly (objects) or the packages it
// inherits them from (strings). Resolve everything down to advisory ids.
function advisoriesOf(name, seen = new Set()) {
  if (seen.has(name) || !vulnerabilities[name]) return [];
  seen.add(name);
  return vulnerabilities[name].via.flatMap((via) =>
    typeof via === 'string'
      ? advisoriesOf(via, seen)
      : [{ id: via.url.split('/').pop(), severity: via.severity, title: via.title }],
  );
}

const allowed = new Set(allowlist.map((entry) => entry.id));
const blocking = new Map();
for (const name of Object.keys(vulnerabilities)) {
  for (const advisory of advisoriesOf(name)) {
    if (BLOCKING.has(advisory.severity) && !allowed.has(advisory.id)) {
      blocking.set(advisory.id, { ...advisory, packages: [...(blocking.get(advisory.id)?.packages ?? []), name] });
    }
  }
}

for (const entry of expired) {
  console.error(`Allowlist entry ${entry.id} (${entry.package}) passed its review date ${entry.reviewBy}.`);
}
for (const advisory of blocking.values()) {
  console.error(`${advisory.severity.toUpperCase()} ${advisory.id}: ${advisory.title} [${advisory.packages.join(', ')}]`);
}

if (blocking.size > 0 || expired.length > 0) {
  console.error('\nFix the advisories above, or add a reviewed entry to .github/audit-allowlist.json.');
  process.exit(1);
}
console.log(`npm audit: no unreviewed high or critical advisories (${allowlist.length} allowlisted).`);
