import "../../styles/contact.css";
import useSEO from "../../hooks/useSEO";

function Contact() {
  useSEO({
    title: "Contact",
    description:
      "Get in touch with Calm Canvas — questions, collaboration ideas, or just to say hello.",
    path: "/contact",
  });

  return (
    <section className="contact">

      <div className="contact-box">

        <span>GET IN TOUCH</span>

        <h1>We'd Love To Hear From You</h1>

        <p>
          Whether you have a question, a collaboration idea,
          or simply want to say hello,
          feel free to reach out anytime.
        </p>

        <div className="email-card complaints-card">

          <h3>Complaints &amp; Support</h3>

          <p>
            Have an issue with an order or our service? Email us at{" "}
            <a href="mailto:shopcalmcanvas@gmail.com">
              shopcalmcanvas@gmail.com
            </a>{" "}
            with your order number and a short description of the problem.
            We aim to respond within 2 business days and to resolve most
            complaints within 7 days. If you're not satisfied with how a
            complaint has been handled, you're welcome to reply and ask for
            it to be reviewed again.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Contact;