// Remembers the country a shopper picked on a product page, so the checkout
// form can start with it filled in. Stored only in this browser; every access
// is wrapped because storage can be unavailable (private windows, etc.).
import { COUNTRIES } from "../config/countries.js";

const KEY = "calmcanvas_ship_country";

export function getSavedCountry() {
  try {
    const name = window.localStorage.getItem(KEY) || "";
    return COUNTRIES.some((country) => country.name === name) ? name : "";
  } catch {
    return "";
  }
}

export function saveCountry(name) {
  try {
    window.localStorage.setItem(KEY, name);
  } catch {
    // Not worth bothering the shopper over.
  }
}
