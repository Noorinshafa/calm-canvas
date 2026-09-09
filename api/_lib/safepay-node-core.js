import { Safepay } from "@sfpy/node-core";

// Small helper -- the node-core SDK's own TypeScript types mark most
// response shapes as `any` (its docs are ahead of what's actually
// published), so we don't trust one exact path. We try several likely
// locations and log the full raw response if none of them match, so a
// mismatch is quick to spot and fix from the Vercel function logs instead
// of failing silently.
export function extractValue(obj, paths) {
  for (const path of paths) {
    const value = path
      .split(".")
      .reduce((o, key) => (o == null ? undefined : o[key]), obj);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function getSafepayEnvironment() {
  return process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";
}

export function createSafepayClient() {
  // The node-core SDK sends this key as the `x-sfpy-merchant-secret` header
  // -- that's your 64-character hex merchant secret (SAFEPAY_V1_SECRET),
  // NOT the public `sec_...` key. The public `sec_...` key (SAFEPAY_SECRET_KEY)
  // is instead passed as `merchant_api_key` inside individual request bodies
  // (see create-checkout-session.js). Mixing these two up is exactly what
  // caused a 404 with the old SDK, so keep this straight.
  const merchantSecret = process.env.SAFEPAY_V1_SECRET;

  if (!merchantSecret) return null;

  const environment = getSafepayEnvironment();
  const host =
    environment === "production"
      ? "api.getsafepay.com"
      : "sandbox.api.getsafepay.com";

  return new Safepay(merchantSecret, {
    authType: "secret",
    host,
  });
}
