import React from "react";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

const Privacy = () => {
  return (
    <div className="page-container" style={{ justifyContent: "center" }}>
      <div
        className="hero-card"
        style={{ maxWidth: "700px", textAlign: "left" }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <ShieldCheck size={50} color="#ff80ab" />
          <h1 style={{ color: "#ff80ab", margin: "10px 0" }}>Privacy Policy</h1>
        </div>

        <div
          style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={20} color="#ff9a9e" /> Data Privacy & Security
          </h3>
          <p style={{ lineHeight: "1.6", color: "#555" }}>
            At SnapBunny, we take your privacy seriously. Here is how we handle
            your data:
          </p>
          <ul style={{ color: "#555", lineHeight: "1.8" }}>
            <li>
              <strong>Local Processing:</strong> All photos taken or uploaded
              are processed locally within your browser. We do not upload your
              raw images to any external server.
            </li>
            <li>
              <strong>No Storage:</strong> We do not store your photos. Once you
              close the tab or refresh the page, your photos are deleted from
              the browser's temporary memory.
            </li>
            <li>
              <strong>Camera Access:</strong> We only access your camera when
              you explicitly grant permission. This access is used strictly for
              taking photos within the app.
            </li>
          </ul>

          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            <EyeOff size={20} color="#ff9a9e" /> Third-Party Services
          </h3>
          <p style={{ lineHeight: "1.6", color: "#555" }}>
            We use minimal third-party services to ensure the app functions
            correctly. We do not sell or share your personal data with
            advertisers.
          </p>

          <hr
            style={{
              margin: "30px 0",
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />

          <p style={{ fontSize: "0.9rem", color: "#888", textAlign: "center" }}>
            Last Updated: November 2025
       
            
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
