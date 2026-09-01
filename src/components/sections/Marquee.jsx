import "../../styles/marquee.css";

const items = [
  "Worldwide Shipping",
  "Made When You Order",
  "Secure Checkout",
  "Original Designs",
  "New Drops Regularly",
];

function Marquee() {
  // Duplicated once so the scrolling loop has no visible seam.
  const line = [...items, ...items];

  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {line.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
