// The full text of the Terms & Conditions and the Privacy Policy.
//
// Kept here, in one place, so that the React pages (what visitors see) and the
// build script scripts/postbuild.mjs (the plain HTML search engines and other
// crawlers receive before any JavaScript runs) always show exactly the same
// legal text.
//
// How to edit: each block is a heading ("h2"), a paragraph ("p") or a bullet
// list ("ul"). Inside the text, **two stars** make words bold, and
// [label](mailto:address) makes an email link. Change the wording here and
// both places update together.
//
// IMPORTANT: relative imports here must keep the ".js" extension, because
// Node (not just Vite) loads this file during the build.

import { CONTACT_EMAIL } from "../config/site.js";

const EMAIL_LINK = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

const INLINE_PATTERN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((mailto:[^)\s]+)\)/g;

// "Email **us** at [a@b.com](mailto:a@b.com)." ->
//   [{ text: "Email " }, { text: "us", strong: true }, { text: " at " },
//    { text: "a@b.com", href: "mailto:a@b.com" }, { text: "." }]
export function parseLegalInline(text = "") {
  const parts = [];
  let lastIndex = 0;
  let match;

  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      parts.push({ text: match[1], strong: true });
    } else {
      parts.push({ text: match[2], href: match[3] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return parts;
}

export const TERMS = {
  h1: "Terms & Conditions",
  intro:
    "Please read these terms carefully before using our website or placing an order.",
  blocks: [
    { type: "h2", text: "1. Introduction" },
    {
      type: "p",
      text: "This website is owned and operated by **ShopCalmCanvas**, a sole proprietorship operated by **Noorin** (referred to throughout this website as \"we\", \"us\" and \"our\"). Our registered business address is: Boshet, PO Khas Sumayar, District Nagar, Gilgit-Baltistan, Hunza Nagar, Nagar-I, Pakistan.",
    },
    {
      type: "p",
      text: "We offer this website, including all information, tools, products and services available from this website, to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.",
    },
    {
      type: "p",
      text: `If you have any problems placing your order on our website, or require support after placing an order through our website, please send us an email at ${EMAIL_LINK}.`,
    },
    { type: "h2", text: "2. Applicability and Updates" },
    {
      type: "p",
      text: "By visiting our site and/or purchasing something from us, you engage in our \"Service\" and agree to be bound by the following terms and conditions (\"Terms and Conditions\"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms and Conditions apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.",
    },
    {
      type: "p",
      text: "In consideration of your use of our website and services, you represent that you are of legal age to form a binding contract and are not a person barred from receiving products and services under the laws of Pakistan or other applicable jurisdiction.",
    },
    {
      type: "p",
      text: "We may need to update our Terms and Conditions from time to time — each time you place an order on our website you will be agreeing to the latest version of our Terms and Conditions.",
    },
    { type: "h2", text: "3. Terms of Usage" },
    {
      type: "p",
      text: "You are prohibited from using this website or its content:",
    },
    {
      type: "ul",
      items: [
        "for any unlawful purpose;",
        "to solicit others to perform or participate in any unlawful acts;",
        "to violate any international, federal, provincial or state laws, regulations and rules;",
        "to infringe upon or violate our intellectual property rights or the intellectual property rights of others;",
        "to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;",
        "to submit false or misleading information;",
        "to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the internet;",
        "to collect or track the personal information of others or spam, phish, pharm, pretext, spider, crawl, or scrape; or",
        "for any obscene or immoral purpose.",
      ],
    },
    {
      type: "p",
      text: "We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.",
    },
    { type: "h2", text: "4. Intellectual Property" },
    {
      type: "p",
      text: "This website and its related software and content (including images and designs) are the intellectual property of ShopCalmCanvas and are exclusively owned by us. The structure, organization and code of the website and its related software contain valuable trade secrets and confidential information belonging to ShopCalmCanvas. Except as expressly stated herein, these Terms and Conditions do not grant you any intellectual property rights whatsoever in the website and its related software, and all rights are reserved by ShopCalmCanvas.",
    },
    { type: "h2", text: "5. Indemnity and Limitation of Liability" },
    {
      type: "p",
      text: "You agree to indemnify, defend and hold us harmless, and our partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your breach of these Terms and Conditions or the documents they incorporate by reference, or your violation of any law or the rights of a third party.",
    },
    {
      type: "p",
      text: "We do not provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors, and we exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
    },
    {
      type: "p",
      text: "Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements. To the extent permitted by law, we also disclaim all warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title and non-infringement.",
    },
    {
      type: "p",
      text: "We reserve the right to not process an order that you place on our website. This is usually for the following reasons:",
    },
    {
      type: "ul",
      items: [
        "We no longer hold stock of the goods or services that you ordered from us.",
        "We are unable to ship goods to your location.",
        "The goods or services that you have ordered are no longer available.",
        "Any reason outside of our control.",
      ],
    },
    { type: "h2", text: "6. Termination" },
    {
      type: "p",
      text: "We may immediately change or terminate your access to our products, services and this website, or any online membership(s) with us, with or without notice, at any time, without liability to you or any other user or third party if, without limitation, you have: (1) provided us with false or misleading registration information; (2) interfered with other users or the administration of our services or website; (3) been the subject of a request by law enforcement or other governmental authorities; or (4) otherwise violated these Terms and Conditions.",
    },
    { type: "h2", text: "7. Severability and Waiver" },
    {
      type: "p",
      text: "If any portion of these terms is found to be unenforceable, the unenforceable portion will be deemed amended to the minimum extent necessary to make it enforceable, and if it can't be made enforceable, then it will be severed and the remaining portion will remain in full force and effect. If we fail to enforce any of these terms, it will not be considered a waiver. Any amendment to or waiver of these terms must be made in writing and signed by us.",
    },
    { type: "h2", text: "8. Governing Law" },
    {
      type: "p",
      text: "Our Terms and Conditions are governed by the laws of the Islamic Republic of Pakistan, and you agree that the courts of Islamabad (including any consumer court) will have exclusive jurisdiction in any dispute that you have with us.",
    },
  ],
};

export const PRIVACY = {
  h1: "Privacy Policy",
  intro:
    "This explains what personal information we collect, how we use it, and how we keep it safe.",
  blocks: [
    { type: "h2", text: "1. Introduction" },
    {
      type: "p",
      text: "This privacy policy (\"Privacy Policy\") applies to the collection and processing of personal data (\"Personal Data\") by ShopCalmCanvas (\"we\", \"us\", \"our\") in connection with this website. This Privacy Policy will help you understand how we collect and use your Personal Data and what we do with it.",
    },
    {
      type: "p",
      text: "By visiting our website and/or purchasing something from us, you agree to us handling your Personal Data in accordance with this Privacy Policy.",
    },
    { type: "h2", text: "2. Personal Data That We Collect" },
    {
      type: "p",
      text: "Personal Data includes any information about an individual from which that person can be identified. It does not include Personal Data where the identity has been removed (anonymous data, e.g. your IP address).",
    },
    {
      type: "p",
      text: "Information you may provide us through the website includes:",
    },
    {
      type: "ul",
      items: [
        "Contact data, such as your first and last name, email address, billing address, shipping address and phone number.",
        "Profile data, such as the username and password that you may set to establish an online account with us.",
        "Communications that we exchange with you, including when you contact us with questions or feedback, through the website, email, or social media (including Facebook, Instagram and WhatsApp).",
        "Transactional data, such as information relating to or needed to complete your orders placed through our website, including order numbers and transaction history.",
      ],
    },
    { type: "h2", text: "3. How We Use Your Personal Data" },
    {
      type: "p",
      text: "We use your Personal Data for the following:",
    },
    {
      type: "ul",
      items: [
        "Provide you with the required services and/or products that you order from our website.",
        "Respond to your questions or requests.",
        "Improve our operations.",
        "Prevent, detect and manage risk against fraud and illegal activities.",
        "Comply with our financial, regulatory and other legal obligations.",
        "Target advertisements, newsletter and service updates.",
        "Improve content and website layout.",
        "Resolve disputes that may arise.",
      ],
    },
    { type: "h2", text: "4. Who Do We Share Your Personal Data With?" },
    {
      type: "p",
      text: "To enable us to provide our products and services to you, we share the minimum information necessary with trusted third parties, specifically:",
    },
    {
      type: "ul",
      items: [
        "**Printify** — our print-on-demand production and fulfillment partner, who receives your order details and shipping address in order to print and ship your order to you.",
        "**Safepay** — our payment processor, who securely handles your payment details in order to process your payment. We do not receive or store your full card details ourselves.",
      ],
    },
    {
      type: "p",
      text: "We share Personal Data with other third-party business partners only when necessary to provide our products and/or services, such as banks, payment method providers (including credit card networks), and courier service providers.",
    },
    { type: "h2", text: "5. How We Protect Your Personal Data" },
    {
      type: "p",
      text: "We make reasonable efforts to ensure a level of security appropriate to the risk associated with the processing of Personal Data. We implement access control measures (physical and virtual), security protocols, policies and standards designed to protect Personal Data against unauthorized access, destruction, loss, alteration or misuse, in line with reasonable industry standards.",
    },
    {
      type: "p",
      text: "We have also put in place procedures to deal with any suspected Personal Data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.",
    },
    { type: "h2", text: "6. How Long Do We Store Your Information?" },
    {
      type: "p",
      text: "We will only retain your Personal Data for as long as necessary to fulfil the purposes we collected it for. This includes, for example, the purposes of satisfying any legal, regulatory, accounting or reporting requirements, or to carry out legal work, or for the establishment or defence of legal claims.",
    },
    {
      type: "p",
      text: "We will retain your information for as long as your account is active or as needed to provide you with our services, comply with our legal and statutory obligations, or verify your information with a financial institution.",
    },
    { type: "h2", text: "7. Cookies and Local Storage" },
    {
      type: "p",
      text: "We use two analytics services to understand how the website is used, such as which pages are viewed and which items are added to the cart. Google Analytics may set cookies in your browser (their names begin with “_ga”) and receives information about your visit, such as the pages you view and your approximate location. We keep Google's advertising features switched off. We also use Ahrefs Web Analytics, a privacy-focused service that counts visits and popular pages without setting cookies.",
    },
    {
      type: "p",
      text: "We also use the Meta Pixel, an advertising tool from Meta (the company behind Facebook and Instagram), to measure how our adverts perform and to show our adverts to people who may be interested in our products. The Meta Pixel may set cookies in your browser (their names begin with “_fb”) and sends Meta information about your visit, such as the pages and products you view, items you add to the cart and purchases you complete. We do not send Meta your name, email address, postal address or payment details. Meta handles this information under its own privacy policy.",
    },
    {
      type: "p",
      text: "If you visit from Europe (including the European Economic Area, the United Kingdom and Switzerland), Google Analytics and the Meta Pixel are switched off and none of these cookies are set unless you choose Accept on our cookie notice. You can change your choice at any time with “Cookie settings” at the bottom of any page.",
    },
    {
      type: "p",
      text: "Apart from those analytics and advertising cookies, the only information we store in your browser is your shopping cart contents (the items you've added, saved locally on your own device using your browser's storage) so that it's still there if you refresh the page or come back later. This stays on your device and is never sent to us until you choose to check out.",
    },
    { type: "h2", text: "8. Contact Us" },
    {
      type: "p",
      text: `If you have any questions about this Privacy Policy or how we handle your Personal Data, please contact us at ${EMAIL_LINK}.`,
    },
  ],
};
