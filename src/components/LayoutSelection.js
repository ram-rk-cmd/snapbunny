import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LayoutSelection = ({ setGlobalLayout }) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("layoutA");

  const layouts = [
    { id: "layoutS", name: "Single", poses: 1, type: "single", count: 1 }, // New Single Layout
    { id: "layoutC", name: "Layout C", poses: 2, type: "strip", count: 2 },
    { id: "layoutB", name: "Layout B", poses: 3, type: "strip", count: 3 },
    { id: "layoutA", name: "Layout A", poses: 4, type: "strip", count: 4 },
    { id: "layoutD", name: "Layout D", poses: 6, type: "grid", count: 6 },
  ];

  const handleContinue = () => {
    const layout = layouts.find((l) => l.id === selectedId);
    setGlobalLayout({ type: layout.id, poses: layout.poses });
    navigate("/capture");
  };

  return (
    <div className="page-container">
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "5px",
            color: "#ff80ab",
          }}
        >
          SnapBunny
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>
          Select a layout to start snapping!
        </p>
      </div>

      <div className="layout-grid">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => setSelectedId(layout.id)}
            className={`layout-card ${
              selectedId === layout.id ? "selected" : ""
            }`}
          >
            <div className="preview-container">
              {/* Added logic for 'single-view' class */}
              <div
                className={`mini-strip ${
                  layout.type === "grid"
                    ? "grid-view"
                    : layout.type === "single"
                    ? "single-view"
                    : ""
                }`}
              >
                {[...Array(layout.count)].map((_, i) => (
                  <div key={i} className="mini-photo">
                    <div className="face-dot"></div>
                  </div>
                ))}
                <div className="mini-footer">
                  <span className="tiny-line"></span>
                </div>
              </div>
            </div>
            <div className="card-info">
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>
                {layout.name}
              </h3>
              <span style={{ color: "#888", fontSize: "0.9rem" }}>
                {layout.poses} Pose
              </span>
            </div>
          </div>
        ))}

        {/* Coming Soon */}
        <div
          className="layout-card"
          style={{ opacity: 0.6, cursor: "not-allowed", background: "#f5f5f5" }}
        >
          <div className="preview-container" style={{ background: "#ddd" }}>
            <span style={{ fontSize: "2rem" }}>🔒</span>
          </div>
          <div className="card-info">
            <h3
              style={{ margin: "0 0 5px 0", fontSize: "1.1rem", color: "#888" }}
            >
              Custom
            </h3>
            <span
              style={{
                color: "#ff80ab",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <button
          className="btn-bunny"
          onClick={handleContinue}
          style={{ padding: "15px 50px", fontSize: "1.2rem" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LayoutSelection;
