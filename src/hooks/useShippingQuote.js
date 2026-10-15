import { useEffect, useState } from "react";

// Asks our server (api/shipping-quote.js, which asks Printify) what shipping
// costs for some items going to a country.
//   lines:   [{ id, variantId, quantity }]
//   country: the country name chosen from the list ("" = not chosen yet)
// Returns { status: "idle" | "loading" | "ready" | "error", options, error,
// refresh }. `options` is [{ key, label, cents, price, estimate }].
export default function useShippingQuote(lines, country) {
  const [state, setState] = useState({ status: "idle", options: [], error: "" });
  const [nonce, setNonce] = useState(0);

  const usable =
    country && lines.length > 0 && lines.every((line) => line.id && line.variantId);
  const key = usable ? JSON.stringify({ country, lines, nonce }) : "";

  useEffect(() => {
    if (!key) {
      setState({ status: "idle", options: [], error: "" });
      return undefined;
    }

    const { country: wantedCountry, lines: wantedLines } = JSON.parse(key);
    const controller = new AbortController();

    setState((current) => ({ ...current, status: "loading", error: "" }));

    fetch("/api/shipping-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: wantedCountry, cart: wantedLines }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "We couldn't work out shipping just now. Please try again."
          );
        }

        setState({ status: "ready", options: data.options || [], error: "" });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({
          status: "error",
          options: [],
          error:
            error.message ||
            "We couldn't work out shipping just now. Please try again.",
        });
      });

    return () => controller.abort();
  }, [key]);

  return { ...state, refresh: () => setNonce((n) => n + 1) };
}
