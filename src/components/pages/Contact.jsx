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

        <div className="email-card">

          <h3>Email</h3>

          <a href="mailto:noorshafa7865@gmail.com">
            noorshafa7865@gmail.com
          </a>

        </div>

      </div>

    </section>
  );
}

export default Contact;