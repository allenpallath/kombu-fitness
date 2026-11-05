// Dependency-free checks run by CI: `npm run check`.
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const errors = [];
const matches = (re) => [...html.matchAll(re)].map((m) => m[1]);

// Local files referenced by the page and the manifest
const refs = matches(/\b(?:href|src)="([^"]+)"/g);
for (const srcset of matches(/\bsrcset="([^"]+)"/g)) {
  refs.push(...srcset.split(",").map((part) => part.trim().split(/\s+/)[0]));
}
const manifest = JSON.parse(readFileSync("site.webmanifest", "utf8"));
refs.push(...manifest.icons.map((icon) => icon.src));

for (const ref of new Set(refs)) {
  if (ref.startsWith("#")) {
    if (ref.length > 1 && !html.includes(`id="${ref.slice(1)}"`)) errors.push(`Broken anchor: ${ref}`);
  } else if (!/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(ref) && !existsSync(ref.split(/[?#]/)[0])) {
    errors.push(`Missing file: ${ref}`);
  }
}

// Structured data
const blocks = matches(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
if (!blocks.length) errors.push("No JSON-LD found");
for (const block of blocks) {
  try {
    JSON.parse(block);
  } catch (err) {
    errors.push(`Invalid JSON-LD: ${err.message}`);
  }
}

// SEO basics
const required = {
  title: /<title>[^<]+<\/title>/,
  description: /<meta name="description" content="[^"]+"/,
  canonical: /<link rel="canonical" href="https:[^"]+"/,
  "og:image": /<meta property="og:image" content="https:[^"]+"/,
};
for (const [name, re] of Object.entries(required)) {
  if (!re.test(html)) errors.push(`Missing ${name}`);
}
if (!/<loc>https:[^<]+<\/loc>/.test(readFileSync("sitemap.xml", "utf8"))) errors.push("sitemap.xml has no <loc>");
if (!/^Sitemap: https:/m.test(readFileSync("robots.txt", "utf8"))) errors.push("robots.txt has no Sitemap line");

if (errors.length) {
  errors.forEach((error) => console.error(`✗ ${error}`));
  process.exit(1);
}
console.log(`✓ ${new Set(refs).size} references, ${blocks.length} JSON-LD block(s), SEO files OK`);
