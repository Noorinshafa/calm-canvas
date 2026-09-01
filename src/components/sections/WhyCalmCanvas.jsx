import { FiHeart, FiPackage, FiGlobe, FiLock } from "react-icons/fi";
import TiltCard from "../ui/TiltCard";
import "../../styles/whycalmcanvas.css";

const features = [
  {
    icon: FiHeart,
    title: "Original Designs",
    text: "Every print starts as original art, made in-house for Calm Canvas.",
  },
  {
    icon: FiPackage,
    title: "Made When You Order",
    text: "Each piece is printed only after you order it — less waste, no overstock.",
  },
  {
    icon: FiGlobe,
    title: "Shipped Worldwide",
    text: "Produced and shipped through our global print network, close to you.",
  },
  {
    icon: FiLock,
    title: "Secure Checkout",
    text: "Payments are encrypted and processed through Stripe's secure system.",
  },
];

function WhyCalmCanvas() {
  return (
    <section className="why-section">

      <div className="why-heading">
        <span className="why-tag">THE CALM CANVAS DIFFERENCE</span>
        <h2>Why Shop With Us</h2>
      </div>

      <div className="why-grid">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <TiltCard className="why-card" key={feature.title} maxTilt={6}>
              <div className="why-icon">
                <Icon size={26} />
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>
            </TiltCard>
          );
        })}

      </div>

    </section>
  );
}

export default WhyCalmCanvas;
