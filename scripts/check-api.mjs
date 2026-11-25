// Build safety check: load every server function before the site is built.
//
// Why: on 19 Nov 2026 checkout crashed on the live site because a package the
// Safepay SDK needs (axios) was missing. The build still passed, because the
// build never loads the server functions in api/, so Vercel put a broken
// payment step live. This script loads each api/*.js file the same way Vercel
// does. If any of them cannot load (a missing package, a bad import, a typo),
// the build stops here and Vercel keeps the previous working version live.
//
// It only loads the files. It does not call any handler, so it never contacts
// Safepay or Printify and never needs secrets. The api/ files only declare
// constants at the top level, so loading them has no side effects.

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "api");

// Vercel turns every top-level .js file in api/ into a server function.
// Files in api/_lib are shared helpers; they are checked through the
// functions that import them.
const files = readdirSync(apiDir)
  .filter((name) => name.endsWith(".js"))
  .sort();

const failures = [];

for (const name of files) {
  try {
    const mod = await import(pathToFileURL(join(apiDir, name)).href);
    if (typeof mod.default !== "function") {
      failures.push(`api/${name}: has no default export handler`);
    }
  } catch (error) {
    failures.push(`api/${name}: ${error?.message || error}`);
  }
}

if (failures.length > 0) {
  console.error("\n[check-api] BUILD STOPPED: these server functions cannot load:");
  for (const line of failures) console.error(`  - ${line}`);
  console.error(
    "[check-api] Fix the problem above (for example a missing package) and build again.\n"
  );
  process.exit(1);
}

console.log(`[check-api] all ${files.length} server functions load correctly`);
