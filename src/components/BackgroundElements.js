import React from "react";

const BackgroundElements = () => {
  return (
    <div
      className="background-decorations"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none", // Crucial: lets you click buttons through the emojis
        overflow: "hidden",
      }}
    >
      <div className="floating-shape shape-1">☁️</div>
      <div className="floating-shape shape-2">✨</div>
      <div className="floating-shape shape-3">🌸</div>
      <div className="floating-shape shape-4">🐰</div>
      <div className="floating-shape shape-5">☁️</div>
      <div className="floating-shape shape-6">💖</div>
    </div>
  );
};

export default BackgroundElements;
