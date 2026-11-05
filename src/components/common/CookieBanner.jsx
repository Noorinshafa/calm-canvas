import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  OPEN_CONSENT_EVENT,
  getStoredConsent,
  setAnalyticsConsent,
  visitorNeedsConsentChoice,
} from "../../utils/analytics";

// A small accept/decline notice for visitors in Europe (including the UK and
// Switzerland). It appears only for them, only until they choose, and can be
// opened again from "Cookie settings" in the footer. Analytics does not run
// for these visitors unless they press Accept -- see src/utils/analytics.js.
// Both buttons have the same size and weight on purpose.
function CookieBanner() {
  // The page is only ever built in the browser (never pre-rendered by React),
  // so the device's time zone and saved choice can be read right away.
  const [open, setOpen] = useState(
    () => visitorNeedsConsentChoice() && getStoredConsent() === null
  );
  const titleRef = useRef(null);
  const reopened = useRef(false);

  useEffect(() => {
    function reopen() {
      reopened.current = true;
      setOpen(true);
    }

    window.addEventListener(OPEN_CONSENT_EVENT, reopen);

    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // When the visitor asks for the settings themselves, move keyboard focus to
  // the notice. It is not moved on the first automatic appearance.
  useEffect(() => {
    if (open && reopened.current) {
      reopened.current = false;
      titleRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  function choose(granted) {
    setAnalyticsConsent(granted);
    setOpen(false);
  }

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-banner-text">
        <h2 id="cookie-banner-title" ref={titleRef} tabIndex={-1}>
          Cookies
        </h2>

        <p>
          We&apos;d like to use Google Analytics cookies to see which pages are
          visited. No advertising cookies. You can change this any time via
          &ldquo;Cookie settings&rdquo; in the footer.{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
      </div>

      <div className="cookie-banner-actions">
        <button type="button" onClick={() => choose(false)}>
          Decline
        </button>

        <button type="button" onClick={() => choose(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
