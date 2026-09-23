import "../../styles/legal.css";
import useSEO from "../../hooks/useSEO";

function Terms() {
  useSEO({
    title: "Terms & Conditions",
    description:
      "The terms and conditions that apply when you use the ShopCalmCanvas website or place an order with us.",
    path: "/terms",
  });

  return (
    <section className="legal-page">

      <div className="legal-hero">

        <span>LEGAL</span>

        <h1>Terms &amp; Conditions</h1>

        <p>
          Please read these terms carefully before using our website
          or placing an order.
        </p>

      </div>

      <div className="legal-content">

        <h2>1. Introduction</h2>

        <p>
          This website is owned and operated by <strong>ShopCalmCanvas</strong> (referred
          to throughout this website as "we", "us" and "our"). Our registered
          office and principal place of business is located in Islamabad, Pakistan.
        </p>

        <p>
          We offer this website, including all information, tools, products and
          services available from this website, to you, the user, conditioned
          upon your acceptance of all terms, conditions, policies and notices
          stated here.
        </p>

        <p>
          If you have any problems placing your order on our website, or
          require support after placing an order through our website, please
          send us an email at{" "}
          <a href="mailto:shopcalmcanvas@gmail.com">shopcalmcanvas@gmail.com</a>.
        </p>

        <h2>2. Applicability and Updates</h2>

        <p>
          By visiting our site and/or purchasing something from us, you engage
          in our "Service" and agree to be bound by the following terms and
          conditions ("Terms and Conditions"), including those additional
          terms and conditions and policies referenced herein and/or available
          by hyperlink. These Terms and Conditions apply to all users of the
          site, including without limitation users who are browsers, vendors,
          customers, merchants, and/or contributors of content.
        </p>

        <p>
          In consideration of your use of our website and services, you
          represent that you are of legal age to form a binding contract and
          are not a person barred from receiving products and services under
          the laws of Pakistan or other applicable jurisdiction.
        </p>

        <p>
          We may need to update our Terms and Conditions from time to time —
          each time you place an order on our website you will be agreeing to
          the latest version of our Terms and Conditions.
        </p>

        <h2>3. Terms of Usage</h2>

        <p>You are prohibited from using this website or its content:</p>

        <ul>
          <li>for any unlawful purpose;</li>
          <li>to solicit others to perform or participate in any unlawful acts;</li>
          <li>to violate any international, federal, provincial or state laws, regulations and rules;</li>
          <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
          <li>to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
          <li>to submit false or misleading information;</li>
          <li>to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the internet;</li>
          <li>to collect or track the personal information of others or spam, phish, pharm, pretext, spider, crawl, or scrape; or</li>
          <li>for any obscene or immoral purpose.</li>
        </ul>

        <p>
          We reserve the right to terminate your use of the Service or any
          related website for violating any of the prohibited uses.
        </p>

        <h2>4. Intellectual Property</h2>

        <p>
          This website and its related software and content (including images
          and designs) are the intellectual property of ShopCalmCanvas and are
          exclusively owned by us. The structure, organization and code of the
          website and its related software contain valuable trade secrets and
          confidential information belonging to ShopCalmCanvas. Except as
          expressly stated herein, these Terms and Conditions do not grant you
          any intellectual property rights whatsoever in the website and its
          related software, and all rights are reserved by ShopCalmCanvas.
        </p>

        <h2>5. Indemnity and Limitation of Liability</h2>

        <p>
          You agree to indemnify, defend and hold us harmless, and our
          partners, officers, directors, agents, contractors, licensors,
          service providers, subcontractors, suppliers, interns and employees,
          harmless from any claim or demand, including reasonable attorneys'
          fees, made by any third party due to or arising out of your breach
          of these Terms and Conditions or the documents they incorporate by
          reference, or your violation of any law or the rights of a third
          party.
        </p>

        <p>
          We do not provide any warranty or guarantee as to the accuracy,
          timeliness, performance, completeness or suitability of the
          information and materials found or offered on this website for any
          particular purpose. You acknowledge that such information and
          materials may contain inaccuracies or errors, and we exclude
          liability for any such inaccuracies or errors to the fullest extent
          permitted by law.
        </p>

        <p>
          Your use of any information or materials on this website is entirely
          at your own risk, for which we shall not be liable. It shall be your
          own responsibility to ensure that any products, services or
          information available through this website meet your specific
          requirements. To the extent permitted by law, we also disclaim all
          warranties, whether express or implied, including the implied
          warranties of merchantability, fitness for a particular purpose,
          title and non-infringement.
        </p>

        <p>We reserve the right to not process an order that you place on our website. This is usually for the following reasons:</p>

        <ul>
          <li>We no longer hold stock of the goods or services that you ordered from us.</li>
          <li>We are unable to ship goods to your location.</li>
          <li>The goods or services that you have ordered are no longer available.</li>
          <li>Any reason outside of our control.</li>
        </ul>

        <h2>6. Termination</h2>

        <p>
          We may immediately change or terminate your access to our products,
          services and this website, or any online membership(s) with us, with
          or without notice, at any time, without liability to you or any
          other user or third party if, without limitation, you have: (1)
          provided us with false or misleading registration information; (2)
          interfered with other users or the administration of our services or
          website; (3) been the subject of a request by law enforcement or
          other governmental authorities; or (4) otherwise violated these
          Terms and Conditions.
        </p>

        <h2>7. Severability and Waiver</h2>

        <p>
          If any portion of these terms is found to be unenforceable, the
          unenforceable portion will be deemed amended to the minimum extent
          necessary to make it enforceable, and if it can't be made
          enforceable, then it will be severed and the remaining portion will
          remain in full force and effect. If we fail to enforce any of these
          terms, it will not be considered a waiver. Any amendment to or
          waiver of these terms must be made in writing and signed by us.
        </p>

        <h2>8. Governing Law</h2>

        <p>
          Our Terms and Conditions are governed by the laws of the Islamic
          Republic of Pakistan, and you agree that the courts of Islamabad
          (including any consumer court) will have exclusive jurisdiction in
          any dispute that you have with us.
        </p>

      </div>

    </section>
  );
}

export default Terms;
