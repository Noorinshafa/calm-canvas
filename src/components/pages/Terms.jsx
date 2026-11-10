import LegalPage from "../common/LegalPage";
import { PAGES } from "../../config/site.js";
import { TERMS } from "../../content/legal.js";

// The wording is in src/content/legal.js (shared with the build script).
function Terms() {
  return <LegalPage page={PAGES.terms} doc={TERMS} />;
}

export default Terms;
