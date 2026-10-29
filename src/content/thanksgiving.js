// Thanksgiving section for the home page.
//
// This file is plain JavaScript with no React in it. The products come from
// the "thanksgiving" theme in src/content/themes.js (the same list the
// /thanksgiving-gifts page shows); only the short texts and the dates below
// are written here.

import { getTheme, themeHomeProducts } from "./themes.js";

export const THANKSGIVING_PATH = "/thanksgiving-gifts";

export const THANKSGIVING_HOME = {
  heading: "Thanksgiving gifts &",
  headingEm: "cozy fall finds",
  lede:
    "Grateful and harvest designs for the host, the family and the long weekend: mugs, totes, sweatshirts and more. Original ShopCalmCanvas art, printed to order.",
  button: "Shop Thanksgiving & fall gifts",
  note: "Every item is made after you order, so order Thanksgiving gifts about three weeks ahead.",
  lateNote:
    "Every item is made after you order, so new orders may arrive after Thanksgiving. These designs make good fall gifts too.",
  trust: ["Original ShopCalmCanvas art", "Printed to order", "Secure Safepay checkout"],
};

// Thanksgiving is the fourth Thursday of November.
export function thanksgivingDate(year) {
  const firstDow = new Date(year, 10, 1).getDay(); // 0 = Sunday
  const firstThursday = 1 + ((4 - firstDow + 7) % 7);
  return new Date(year, 10, firstThursday + 21);
}

// Printing takes 2-7 business days and delivery a few more (see the Shipping
// page), so an order placed less than this many days before Thanksgiving may
// not arrive in time.
export const ORDER_AHEAD_DAYS = 17;

// The home page section shows from 1 October until Thanksgiving Day, then goes
// away by itself (the Christmas section is already there). The countdown is
// only shown while an order can still arrive in time; after that the note
// under the products says so honestly. The /thanksgiving-gifts page stays
// online all year so it keeps its place in search results.
export function thanksgivingSeason(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(now.getFullYear(), 9, 1);
  const day = thanksgivingDate(now.getFullYear());

  const visible = today >= start && today <= day;
  const daysLeft = Math.round((day - today) / 86400000);

  return { visible, daysLeft, canArrive: daysLeft >= ORDER_AHEAD_DAYS };
}

export function thanksgivingCountLabel(daysLeft) {
  if (daysLeft === 0) return "Happy Thanksgiving";
  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} until Thanksgiving`;
}

// The products for the home section (at most 8).
export function thanksgivingHomeProducts(products) {
  return themeHomeProducts(getTheme("thanksgiving"), products, 8);
}
