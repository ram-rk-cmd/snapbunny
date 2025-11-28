import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import LayoutSelection from "./components/LayoutSelection";
import CapturePage from "./components/CapturePage";
import PhotoPreview from "./components/PhotoPreview";
import Contact from "./components/Contact";
import Privacy from "./components/Privacy";
import BackgroundElements from "./components/BackgroundElements";
import "./App.css";

function App() {
  const [selectedLayout, setSelectedLayout] = useState({
    type: "layoutA",
    poses: 4,
  });
  const [capturedImages, setCapturedImages] = useState([]);

  return (
    <Router>
      <div className="App" style={{ position: "relative" }}>
        {/* Render Background Everywhere */}
        <BackgroundElements />

        <Navbar />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* PrintIt Studio Page */}
            <Route
              path="/printit"
              element={<LayoutSelection setGlobalLayout={setSelectedLayout} />}
            />

            <Route
              path="/capture"
              element={
                <CapturePage
                  layout={selectedLayout}
                  setGlobalImages={setCapturedImages}
                />
              }
            />

            <Route
              path="/preview"
              element={
                capturedImages.length > 0 ? (
                  <PhotoPreview
                    capturedImages={capturedImages}
                    selectedLayout={selectedLayout}
                  />
                ) : (
                  <Navigate to="/capture" replace />
                )
              }
            />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
