// The countries a customer can choose at checkout -- and the ONLY countries
// the store ships to.
//
// Since 27 Nov 2026 ShopCalmCanvas ships to four markets only: the United
// States, the United Kingdom, Canada and Europe (the 27 EU countries plus
// Norway, Switzerland and Iceland). 33 countries in total.
//
// This one list is the gatekeeper on BOTH sides:
// - the website shows only these countries (checkout and the product-page
//   shipping estimate), and
// - the server refuses every other country: api/_lib/shipping.js calls
//   countryCodeFor() and returns 400 when it gives "", so no shipping quote,
//   no Safepay session and no Printify order can exist for another country,
//   even from a hand-made request.
// Each print provider can still have its own limits; if one can't ship a
// product to a listed country, checkout says so before payment.
//
// Plain JavaScript with no imports: used by the checkout page (the dropdown)
// and by api/_lib/create-printify-order.js (turns the name into the 2-letter
// code Printify needs).

// United States, United Kingdom and Canada first (the main markets), then
// Europe A-Z.
const COUNTRY_LIST = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AT", "Austria"],
  ["BE", "Belgium"],
  ["BG", "Bulgaria"],
  ["HR", "Croatia"],
  ["CY", "Cyprus"],
  ["CZ", "Czechia"],
  ["DK", "Denmark"],
  ["EE", "Estonia"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["GR", "Greece"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IE", "Ireland"],
  ["IT", "Italy"],
  ["LV", "Latvia"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MT", "Malta"],
  ["NL", "Netherlands"],
  ["NO", "Norway"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["RO", "Romania"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["ES", "Spain"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
];

export const COUNTRIES = COUNTRY_LIST.map(([code, name]) => ({ code, name }));

// Older spellings that were accepted before the dropdown existed.
const ALIASES = {
  USA: "US",
  "United States of America": "US",
  UK: "GB",
  "Great Britain": "GB",
  England: "GB",
  Scotland: "GB",
  Wales: "GB",
};

const NAME_TO_CODE = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]));
const CODES = new Set(COUNTRIES.map((c) => c.code));

// "United States" -> "US". Also accepts a 2-letter code or an old alias.
// Returns "" when the country isn't one we ship to.
export function countryCodeFor(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const upper = text.toUpperCase();
  if (CODES.has(upper)) return upper;

  if (ALIASES[text]) return ALIASES[text];

  return NAME_TO_CODE.get(text.toLowerCase()) || "";
}
