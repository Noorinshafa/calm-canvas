import "./../../styles/floatingcard.css";

function FloatingCard({ image, title, price, className }) {
  return (
    <div className={`floating-card ${className}`}>

      <div className="floating-glow"></div>

      <img
      className="floating-card-image"
        src={image}
        alt={title}
      />

      <div className="floating-card-info">

        <h3>{title}</h3>

        <p>{price}</p>

      </div>

    </div>
  );
}

export default FloatingCard;