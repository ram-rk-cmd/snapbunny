import React from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, Heart, Star } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="hero-card">
        <div className="icon-bounce">
          <Camera size={60} color="#ff80ab" strokeWidth={2.5} />
        </div>
        <h1 className="title-gradient">SnapBunny</h1>
        <p className="subtitle">
          The cutest online photo booth.
          <br />
          Snap, decorate, and share your moments!
        </p>
        <div className="features-grid">
          <div className="feature-item">
            <Sparkles size={18} color="#aaa" />
            <span>Aesthetic Filters</span>
          </div>
          <div className="feature-item">
            <Heart size={18} color="#aaa" />
            <span>Cute Stickers</span>
          </div>
          <div className="feature-item">
            <Star size={18} color="#aaa" />
            <span>Instant GIF</span>
          </div>
        </div>
        <button
          className="btn-bunny-large"
          onClick={() => navigate("/printit")}
        >
          Start Snapping! 📸
        </button>
      </div>
      <div className="footer-note">
        <p>Made with 💖 for you</p>
      </div>
    </div>
  );
};
export default Home;
