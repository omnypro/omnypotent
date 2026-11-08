const HOST = "https://cdn.omnyist.productions";
const ALLOWED = [
  "https://omnyist.productions",
  "https://www.omnyist.productions",
  "https://tools.omny.pro",
  "http://localhost:4321",
  "http://localhost:6006",
];
const FOREIGN = ["https://example.com", "https://omny.pro.evil.example"];

export type CdnIssue = { check: string; message: string };

async function head(url: string, origin?: string) {
  return fetch(url, {
    method: "HEAD",
    headers: origin ? { Origin: origin } : {},
  });
}

export async function checkCdn(path: string): Promise<CdnIssue[]> {
  const url = `${HOST}/${path}`;
  const issues: CdnIssue[] = [];
  const report = (check: string, message: string) =>
    issues.push({ check, message });

  const plain = await head(url);
  if (plain.status !== 200) report("status", `got ${plain.status}`);
  if (!plain.headers.get("content-type")?.startsWith("font/")) {
    report("content-type", `got ${plain.headers.get("content-type")}`);
  }
  if (!plain.headers.get("cache-control")?.includes("immutable")) {
    report("cache-control", `got ${plain.headers.get("cache-control")}`);
  }

  for (const origin of ALLOWED) {
    const res = await head(url, origin);
    const echoed = res.headers.get("access-control-allow-origin");
    if (echoed !== origin) report(`cors ${origin}`, `got ${echoed}`);
  }
  for (const origin of FOREIGN) {
    const res = await head(url, origin);
    const echoed = res.headers.get("access-control-allow-origin");
    if (echoed !== null) report(`cors ${origin}`, `allowed as ${echoed}`);
  }
  return issues;
}

if (import.meta.main) {
  const path = process.argv[2] ?? "hurme/HurmeGeometricSans2-Regular.woff2";
  const issues = await checkCdn(path);
  for (const issue of issues) console.log(`${issue.check}: ${issue.message}`);
  if (issues.length === 0) console.log(`${HOST}/${path}: all checks pass`);
  process.exit(issues.length === 0 ? 0 : 1);
}
