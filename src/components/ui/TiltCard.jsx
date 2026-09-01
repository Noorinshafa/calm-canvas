import { useRef } from "react";
import "../../styles/tiltcard.css";

// A lightweight, dependency-free 3D tilt wrapper.
//
// Instead of a fixed CSS ":hover" angle (which looks the same no matter
// where the cursor is), this tracks the actual mouse position over the
// card and tilts it toward the cursor — a real 3D feel, not just a canned
// hover animation. No extra library needed; it's plain transforms.
function TiltCard({ children, className = "", maxTilt = 10, ...rest }) {
  const cardRef = useRef(null);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function handleMouseMove(e) {
    if (reduceMotion) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `
      perspective(1000px)
      rotateX(${(-y * maxTilt).toFixed(2)}deg)
      rotateY(${(x * maxTilt).toFixed(2)}deg)
      translateY(-6px)
      scale(1.02)
    `;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </div>
  );
}

export default TiltCard;
