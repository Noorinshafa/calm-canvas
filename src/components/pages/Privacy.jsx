import "../../styles/legal.css";
import useSEO from "../../hooks/useSEO";

function Privacy() {
  useSEO({
    title: "Privacy Policy",
    description:
      "How ShopCalmCanvas collects, uses, and protects your personal data.",
    path: "/privacy-policy",
  });

  return (
    <section className="legal-page">

      <div className="legal-hero">

        <span>LEGAL</span>

        <h1>Privacy Policy</h1>

        <p>
          This explains what personal information we collect, how we use it,
          and how we keep it safe.
        </p>

      </div>

      <div className="legal-content">

        <h2>1. Introduction</h2>

        <p>
          This privacy policy ("Privacy Policy") applies to the collection
          and processing of personal data ("Personal Data") by ShopCalmCanvas
          ("we", "us", "our") in connection with this website. This Privacy
          Policy will help you understand how we collect and use your
          Personal Data and what we do with it.
        </p>

        <p>
          By visiting our website and/or purchasing something from us, you
          agree to us handling your Personal Data in accordance with this
          Privacy Policy.
        </p>

        <h2>2. Personal Data That We Collect</h2>

        <p>
          Personal Data includes any information about an individual from
          which that person can be identified. It does not include Personal
          Data where the identity has been removed (anonymous data, e.g. your
          IP address).
        </p>

        <p>Information you may provide us through the website includes:</p>

        <ul>
          <li>Contact data, such as your first and last name, email address, billing address, shipping address and phone number.</li>
          <li>Profile data, such as the username and password that you may set to establish an online account with us.</li>
          <li>Communications that we exchange with you, including when you contact us with questions or feedback, through the website, email, or social media (including Facebook, Instagram and WhatsApp).</li>
          <li>Transactional data, such as information relating to or needed to complete your orders placed through our website, including order numbers and transaction history.</li>
        </ul>

        <h2>3. How We Use Your Personal Data</h2>

        <p>We use your Personal Data for the following:</p>

        <ul>
          <li>Provide you with the required services and/or products that you order from our website.</li>
          <li>Respond to your questions or requests.</li>
          <li>Improve our operations.</li>
          <li>Prevent, detect and manage risk against fraud and illegal activities.</li>
          <li>Comply with our financial, regulatory and other legal obligations.</li>
          <li>Target advertisements, newsletter and service updates.</li>
          <li>Improve content and website layout.</li>
          <li>Resolve disputes that may arise.</li>
        </ul>

        <h2>4. Who Do We Share Your Personal Data With?</h2>

        <p>
          To enable us to provide our products and services to you, we share
          the minimum information necessary with trusted third parties,
          specifically:
        </p>

        <ul>
          <li><strong>Printify</strong> — our print-on-demand production and fulfillment partner, who receives your order details and shipping address in order to print and ship your order to you.</li>
          <li><strong>Safepay</strong> — our payment processor, who securely handles your payment details in order to process your payment. We do not receive or store your full card details ourselves.</li>
        </ul>

        <p>
          We share Personal Data with other third-party business partners only
          when necessary to provide our products and/or services, such as
          banks, payment method providers (including credit card networks),
          and courier service providers.
        </p>

        <h2>5. How We Protect Your Personal Data</h2>

        <p>
          We make reasonable efforts to ensure a level of security appropriate
          to the risk associated with the processing of Personal Data. We
          implement access control measures (physical and virtual), security
          protocols, policies and standards designed to protect Personal Data
          against unauthorized access, destruction, loss, alteration or
          misuse, in line with reasonable industry standards.
        </p>

        <p>
          We have also put in place procedures to deal with any suspected
          Personal Data breach and will notify you and any applicable
          regulator of a breach where we are legally required to do so.
        </p>

        <h2>6. How Long Do We Store Your Information?</h2>

        <p>
          We will only retain your Personal Data for as long as necessary to
          fulfil the purposes we collected it for. This includes, for example,
          the purposes of satisfying any legal, regulatory, accounting or
          reporting requirements, or to carry out legal work, or for the
          establishment or defence of legal claims.
        </p>

        <p>
          We will retain your information for as long as your account is
          active or as needed to provide you with our services, comply with
          our legal and statutory obligations, or verify your information with
          a financial institution.
        </p>

        <h2>7. Cookies and Local Storage</h2>

        <p>
          This website does not use advertising or tracking cookies, and we
          do not run analytics software that profiles individual visitors.
          The only information we store in your browser is your shopping
          cart contents (the items you've added, saved locally on your own
          device using your browser's storage) so that it's still there if
          you refresh the page or come back later. This stays on your device
          and is never sent to us until you choose to check out.
        </p>

        <h2>8. Contact Us</h2>

        <p>
          If you have any questions about this Privacy Policy or how we
          handle your Personal Data, please contact us at{" "}
          <a href="mailto:shopcalmcanvas@gmail.com">shopcalmcanvas@gmail.com</a>.
        </p>

      </div>

    </section>
  );
}

export default Privacy;
