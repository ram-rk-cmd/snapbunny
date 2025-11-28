import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Upload } from "lucide-react";

const FILTERS = [
  { name: "Normal", class: "filter-normal" },
  { name: "B&W", class: "filter-bw" },
  { name: "Vintage", class: "filter-vintage" },
  { name: "Soft", class: "filter-soft" },
  { name: "Warm", class: "filter-warm" },
  { name: "Cool", class: "filter-cool" },
];

const CapturePage = ({ layout, setGlobalImages }) => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [timerDuration, setTimerDuration] = useState(3);
  const [countdown, setCountdown] = useState(null);
  const [activeFilter, setActiveFilter] = useState("filter-normal");
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    Swal.fire({
      title: "Ready to Snap?",
      text: "Make us smile! 😊",
      confirmButtonText: "I'm Ready!",
      confirmButtonColor: "#ff80ab",
      background: "#fff0f5",
      color: "#5d4037",
    });
  }, []);

  const captureFrame = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      const filterStyle = getComputedStyle(
        document.querySelector(`.${activeFilter}`)
      ).filter;
      ctx.filter = filterStyle !== "none" ? filterStyle : "none";
      ctx.drawImage(img, 0, 0);
      setImages((prev) => [...prev, canvas.toDataURL("image/jpeg")]);
    };
  }, [activeFilter]);

  const startSequence = () => {
    setImages([]);
    setIsCapturing(true);
    let shotsTaken = 0;
    const runShot = () => {
      if (shotsTaken >= layout.poses) {
        setIsCapturing(false);
        setCountdown(null);
        return;
      }
      let count = timerDuration;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          captureFrame();
          shotsTaken++;
          if (shotsTaken < layout.poses) setTimeout(runShot, 1000);
          else {
            setIsCapturing(false);
            setCountdown(null);
          }
        }
      }, 1000);
    };
    runShot();
  };

  useEffect(() => {
    if (images.length === layout.poses && !isCapturing) {
      setGlobalImages(images);
      Swal.fire({
        icon: "success",
        title: "Snaps Captured!",
        timer: 1500,
        showConfirmButton: false,
        willClose: () => navigate("/preview"),
      });
    }
  }, [images, layout.poses, isCapturing, navigate, setGlobalImages]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImages([...images, e.target.result]);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <button
          className="btn-secondary"
          onClick={() => fileInputRef.current.click()}
        >
          <Upload size={18} /> Upload
        </button>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
        />
        <label style={{ fontWeight: "bold" }}>Timer: {timerDuration}s</label>
        <input
          type="range"
          min="1"
          max="10"
          value={timerDuration}
          onChange={(e) => setTimerDuration(parseInt(e.target.value))}
        />
      </div>
      <div
        style={{
          position: "relative",
          border: "8px solid white",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className={activeFilter}
          style={{ width: "600px", height: "450px", objectFit: "cover" }}
        />
        {countdown > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "8rem",
              color: "white",
              fontWeight: "bold",
              textShadow: "0 0 15px rgba(0,0,0,0.3)",
            }}
          >
            {countdown}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFilter(f.class)}
            style={{
              background: activeFilter === f.class ? "#ff80ab" : "white",
              color: activeFilter === f.class ? "white" : "#5d4037",
              border: "none",
              padding: "8px 15px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          className="btn-bunny"
          onClick={startSequence}
          disabled={isCapturing}
        >
          {isCapturing ? "Snapping..." : "Start Capture"}
        </button>
        <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="snap"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "5px",
                objectFit: "cover",
                border: "2px solid white",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default CapturePage;
