// Shipping report (read-only).
//
// What it does: for every product in your Printify shop it looks up what
// Printify charges YOU for shipping, to several countries, and compares that
// with what you charge customers. It never creates an order and never prints
// or saves your Printify token.
//
// How to run (from the project folder, PowerShell):
//   node --env-file=.env.local scripts/shipping-report.mjs
//
// It writes shipping-report.local.json next to package.json. Files ending in
// ".local.json" are ignored by Git (see .gitignore), so it can't be committed
// by accident.

import fs from "node:fs";

const TOKEN = process.env.PRINTIFY_API_TOKEN;
const BASE = "https://api.printify.com/v1";
const SHOP_ID = "23619549";

if (!TOKEN) {
  console.error(
    "PRINTIFY_API_TOKEN not found. Run this from the project folder with:\n" +
      "  node --env-file=.env.local scripts/shipping-report.mjs"
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Plain GET/POST with polite pacing and one retry on rate limiting.
async function call(method, path, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 429) {
      await sleep(15000);
      continue;
    }
    let data = null;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text.slice(0, 300) };
    }
    return { ok: response.ok, status: response.status, data };
  }
  return { ok: false, status: 429, data: { message: "rate limited" } };
}

// Countries to test with the order-level shipping calculator. These are
// calculations only. The addresses are made-up placeholders.
const TEST_ADDRESSES = [
  { country: "US", region: "NY", city: "New York", zip: "10001" },
  { country: "GB", region: "London", city: "London", zip: "SW1A 1AA" },
  { country: "CA", region: "ON", city: "Toronto", zip: "M5V 2T6" },
  { country: "AU", region: "NSW", city: "Sydney", zip: "2000" },
  { country: "PK", region: "Islamabad", city: "Islamabad", zip: "44000" },
  { country: "DE", region: "Berlin", city: "Berlin", zip: "10115" },
  { country: "FR", region: "Paris", city: "Paris", zip: "75001" },
  { country: "AE", region: "Dubai", city: "Dubai", zip: "00000" },
  { country: "SA", region: "Riyadh", city: "Riyadh", zip: "11564" },
  { country: "IN", region: "Delhi", city: "New Delhi", zip: "110001" },
  { country: "NZ", region: "Auckland", city: "Auckland", zip: "1010" },
  { country: "SG", region: "Singapore", city: "Singapore", zip: "018956" },
];

async function main() {
  console.log("1/4 Reading your products...");
  const products = [];
  for (let page = 1; ; page++) {
    const r = await call("GET", `/shops/${SHOP_ID}/products.json?limit=50&page=${page}`);
    if (!r.ok) {
      console.error("Could not read products:", r.status, r.data?.message || "");
      if (r.status === 401) {
        // Safe hints only: the token's shape, never its value.
        console.error(
          "\nPrintify did not accept the token found in .env.local. Shape of that token:\n" +
            `  length: ${TOKEN.length} characters\n` +
            `  starts with 'eyJ' (normal for Printify tokens): ${TOKEN.startsWith("eyJ") ? "yes" : "NO"}\n` +
            `  contains spaces or line breaks: ${/\s/.test(TOKEN) ? "YES (problem)" : "no"}\n` +
            `  contains quote marks: ${/["']/.test(TOKEN) ? "YES (problem)" : "no"}\n` +
            `  starts with the word Bearer: ${/^bearer/i.test(TOKEN) ? "YES (problem)" : "no"}`
        );
      }
      process.exitCode = 1;
      return;
    }
    products.push(...(r.data.data || []));
    if (page >= (r.data.last_page || 1)) break;
    await sleep(300);
  }
  console.log(`   ${products.length} products found.`);

  const blueprintTitles = new Map();
  const bpList = await call("GET", "/catalog/blueprints.json");
  for (const b of bpList.data || []) blueprintTitles.set(Number(b.id), b.title);
  await sleep(300);
  const providerNames = new Map();
  const ppList = await call("GET", "/catalog/print_providers.json");
  for (const p of ppList.data || []) providerNames.set(Number(p.id), p.title);

  // Group products by (blueprint, print provider): shipping depends on these.
  const groups = new Map();
  for (const product of products) {
    const key = `${product.blueprint_id}:${product.print_provider_id}`;
    const enabled = (product.variants || []).filter(
      (v) => v.is_enabled !== false && v.is_available !== false
    );
    if (!groups.has(key)) {
      groups.set(key, {
        blueprint_id: product.blueprint_id,
        blueprint: blueprintTitles.get(Number(product.blueprint_id)) || "",
        print_provider_id: product.print_provider_id,
        print_provider: providerNames.get(Number(product.print_provider_id)) || "",
        products: [],
      });
    }
    const prices = enabled.map((v) => v.price).filter((n) => typeof n === "number");
    const costs = enabled.map((v) => v.cost).filter((n) => typeof n === "number");
    groups.get(key).products.push({
      id: product.id,
      title: product.title,
      enabled_variants: enabled.length,
      price_cents_min: prices.length ? Math.min(...prices) : null,
      price_cents_max: prices.length ? Math.max(...prices) : null,
      cost_cents_min: costs.length ? Math.min(...costs) : null,
      cost_cents_max: costs.length ? Math.max(...costs) : null,
      sample_variant_id: enabled.length
        ? enabled.slice().sort((a, b) => (a.price || 0) - (b.price || 0))[0].id
        : null,
    });
  }
  console.log(`   ${groups.size} product type / supplier combinations.`);

  console.log("2/4 Reading Printify's shipping tables per product type...");
  for (const group of groups.values()) {
    const r = await call(
      "GET",
      `/catalog/blueprints/${group.blueprint_id}/print_providers/${group.print_provider_id}/shipping.json`
    );
    group.catalog_shipping = r.ok ? r.data : { error: r.status, message: r.data?.message };
    await sleep(700); // catalog endpoints are limited to 100 requests/minute
  }

  console.log("3/4 Asking Printify's shipping calculator for real quotes (no orders are created)...");
  let done = 0;
  for (const group of groups.values()) {
    group.quotes = {};
    const sample = group.products.find((p) => p.sample_variant_id);
    if (!sample) continue;
    for (const address of TEST_ADDRESSES) {
      const body = {
        line_items: [
          { product_id: sample.id, variant_id: sample.sample_variant_id, quantity: 1 },
        ],
        address_to: {
          first_name: "Test",
          last_name: "Customer",
          email: "test@example.com",
          phone: "0000000000",
          country: address.country,
          region: address.region,
          city: address.city,
          address1: "1 Test Street",
          zip: address.zip,
        },
      };
      const r = await call("POST", `/shops/${SHOP_ID}/orders/shipping.json`, body);
      group.quotes[address.country] = r.ok
        ? { ok: true, rates: r.data }
        : { ok: false, status: r.status, message: r.data?.message || r.data?.error || r.data };

      // Also a 2-item quote (same product twice) for the US, to learn how
      // additional items are priced.
      if (address.country === "US" && r.ok) {
        const two = JSON.parse(JSON.stringify(body));
        two.line_items[0].quantity = 2;
        const r2 = await call("POST", `/shops/${SHOP_ID}/orders/shipping.json`, two);
        group.quotes.US_two_items = r2.ok
          ? { ok: true, rates: r2.data }
          : { ok: false, status: r2.status, message: r2.data?.message || r2.data };
        await sleep(250);
      }
      await sleep(250);
    }
    done++;
    console.log(`   ${done}/${groups.size} done`);
  }

  console.log("4/4 Saving the report...");
  const report = {
    generated_at: new Date().toISOString(),
    shop_products: products.length,
    groups: [...groups.values()],
  };
  fs.writeFileSync("shipping-report.local.json", JSON.stringify(report, null, 2));

  // Short summary on screen (no secrets in here).
  for (const g of groups.values()) {
    const us = g.quotes?.US;
    const usRate = us?.ok ? JSON.stringify(us.rates) : `not available (${us?.status || "?"})`;
    console.log(
      `- ${g.blueprint || g.blueprint_id} / ${g.print_provider || g.print_provider_id}: ` +
        `${g.products.length} product(s); US quote: ${usRate}`
    );
  }
  console.log("\nSaved shipping-report.local.json. Tell Claude it is done.");
}

main().catch((error) => {
  console.error("Report failed:", error.message);
  process.exitCode = 1;
});
