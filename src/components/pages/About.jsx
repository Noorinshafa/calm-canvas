import "../../styles/about.css";
import useSEO from "../../hooks/useSEO";

function About() {

  useSEO({
    title: "About",
    description:
      "Calm Canvas is a place where elegance, creativity, and thoughtful design come together to make everyday moments feel special.",
    path: "/about",
  });

  return (

    <section className="about">

      <div className="about-hero">

        <span>ABOUT CALM CANVAS</span>

        <h1>
          More Than Accessories.
          <br />
          Little Moments of Joy.
        </h1>

        <p>

          Calm Canvas is a place where elegance,
          creativity, and thoughtful design come together
          to make everyday moments feel special.

        </p>

      </div>

    </section>

  );

}

export default About;