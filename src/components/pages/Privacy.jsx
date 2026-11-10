import LegalPage from "../common/LegalPage";
import { PAGES } from "../../config/site.js";
import { PRIVACY } from "../../content/legal.js";

// The wording is in src/content/legal.js (shared with the build script).
function Privacy() {
  return <LegalPage page={PAGES.privacy} doc={PRIVACY} />;
}

export default Privacy;
