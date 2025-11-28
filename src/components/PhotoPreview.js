import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GIF from "gif.js";
import {
  Download,
  Share2,
  RefreshCw,
  Palette,
  Smile,
  Image as ImageIcon,
} from "lucide-react";

/* --- FRAMES CONFIGURATION --- */
const drawFrame = (ctx, canvas, src) => {
  const frameImg = new Image();
  frameImg.src = src;
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  };
};

const frames = {
  none: { draw: () => {} },
  pastel: {
    draw: (ctx, x, y, width, height) => {
      const drawSticker = (x, y, type) => {
        switch (type) {
          case "star":
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "heart":
            ctx.fillStyle = "#cc8084";
            ctx.beginPath();
            const heartSize = 22;
            ctx.moveTo(x, y + heartSize / 4);
            ctx.bezierCurveTo(
              x,
              y,
              x - heartSize / 2,
              y,
              x - heartSize / 2,
              y + heartSize / 4
            );
            ctx.bezierCurveTo(
              x - heartSize / 2,
              y + heartSize / 2,
              x,
              y + heartSize * 0.75,
              x,
              y + heartSize
            );
            ctx.bezierCurveTo(
              x,
              y + heartSize * 0.75,
              x + heartSize / 2,
              y + heartSize / 2,
              x + heartSize / 2,
              y + heartSize / 4
            );
            ctx.bezierCurveTo(x + heartSize / 2, y, x, y, x, y + heartSize / 4);
            ctx.fill();
            break;
          case "bow":
            ctx.fillStyle = "#f9cee7";
            ctx.beginPath();
            ctx.ellipse(x - 10, y, 10, 6, Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 10, y, 10, 6, -Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#e68bbe";
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            break;
          default:
            break;
        }
      };

      // Draw decorative stickers at corners relative to the photo area
      drawSticker(x + 11, y + 5, "bow");
      drawSticker(x - 18, y + 95, "heart");
      drawSticker(x + width - 40, y + 10, "star");
      drawSticker(x + width - 1, y + 50, "heart");
      drawSticker(x + 20, y + height - 20, "star");
      drawSticker(x + width - 25, y + height - 5, "bow");
    },
  },
  cute: {
    draw: (ctx, x, y, width, height) => {
      // Simple cute decorations
      ctx.fillStyle = "#87CEEB";
      ctx.beginPath();
      ctx.arc(x + 20, y + 5, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x + width - 20, y + 18, 15, 0, Math.PI * 2);
      ctx.fill();

      // Cloud
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(x + width - 40, y + height - 20, 10, 0, Math.PI * 2);
      ctx.arc(x + width - 30, y + height - 30, 12, 0, Math.PI * 2);
      ctx.arc(x + width - 20, y + height - 20, 10, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  // Image Overlay Frames (Assumes images are in /public)
  mofusandImage: {
    draw: (ctx, _, __, w, h) =>
      drawFrame(ctx, ctx.canvas, "/mofusand-frame.png"),
  },
  shinChanImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/shin-chan.png"),
  },
  miffyImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/miffy-frame.png"),
  },
  weddingImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/wedding.png"),
  },
  markImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/mm.png"),
  },
  jellycatImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/jellycat.png"),
  },
  ksaImage: {
    draw: (ctx, _, __, w, h) => drawFrame(ctx, ctx.canvas, "/tmu.png"),
  },
};

const PhotoPreview = ({ capturedImages, selectedLayout }) => {
  const stripCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [stripColor, setStripColor] = useState("white");
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isCreatingGif, setIsCreatingGif] = useState(false);
  const [gifBlob, setGifBlob] = useState(null);

  const layoutType = selectedLayout ? selectedLayout.type : "layoutA";
  const photoCount = selectedLayout ? selectedLayout.poses : 4;

  // --- GIF GENERATION LOGIC ---
  const createGIF = useCallback(async () => {
    if (capturedImages.length === 0 || isCreatingGif || gifBlob) return gifBlob;
    setIsCreatingGif(true);

    return new Promise((resolve, reject) => {
      try {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: 400,
          height: 300,
          workerScript: "/gif.worker.js",
        });

        let imagesLoaded = 0;
        capturedImages.forEach((imageUrl) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = stripColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Simple center crop for GIF
            const ratio = Math.max(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const x = (canvas.width - img.width * ratio) / 2;
            const y = (canvas.height - img.height * ratio) / 2;
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              x,
              y,
              img.width * ratio,
              img.height * ratio
            );

            if (frames[selectedFrame])
              frames[selectedFrame].draw(
                ctx,
                0,
                0,
                canvas.width,
                canvas.height
              );
            gif.addFrame(canvas, { delay: 500, copy: true });

            imagesLoaded++;
            if (imagesLoaded === capturedImages.length) {
              gif.on("finished", (blob) => {
                setGifBlob(blob);
                setIsCreatingGif(false);
                resolve(blob);
              });
              gif.render();
            }
          };
          img.src = imageUrl;
        });
      } catch (error) {
        setIsCreatingGif(false);
        reject(error);
      }
    });
  }, [capturedImages, stripColor, selectedFrame, isCreatingGif, gifBlob]);

  // --- CORE CANVAS DRAWING LOGIC ---
  const generatePhotoStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Config
    const imgWidth = 400;
    const imgHeight = 300;
    const borderSize = 40;
    const photoSpacing = 20;
    const textHeight = 60;

    // 1. Calculate Total Height/Width based on Layout
    let totalHeight;

    if (layoutType === "layoutS") {
      // Single Photo (Polaroid Style) - Square Photo
      canvas.width = imgWidth + borderSize * 2;
      totalHeight = imgWidth + borderSize * 2 + textHeight + 40; // Extra space at bottom for polaroid feel
    } else if (layoutType === "layoutD") {
      // Grid (2 columns)
      totalHeight =
        imgHeight * 3 + photoSpacing * 2 + borderSize * 2 + textHeight;
      canvas.width = imgWidth * 2 + photoSpacing + borderSize * 2;
    } else {
      // Strips (A, B, C)
      const rows = photoCount;
      totalHeight =
        imgHeight * rows +
        photoSpacing * (rows - 1) +
        borderSize * 2 +
        textHeight;
      canvas.width = imgWidth + borderSize * 2;
    }

    canvas.height = totalHeight;

    // 2. Fill Background
    ctx.fillStyle = stripColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Footer Text
    const drawText = () => {
      const now = new Date();
      ctx.fillStyle =
        stripColor === "black" || stripColor === "#800000"
          ? "#FFFFFF"
          : "#5d4037";
      ctx.font = "bold 22px Quicksand";
      ctx.textAlign = "center";
      ctx.fillText("SnapBunny", canvas.width / 2, totalHeight - 35);

      ctx.font = "14px Quicksand";
      ctx.fillStyle =
        stripColor === "black" || stripColor === "#800000" ? "#bbb" : "#888";
      ctx.fillText(
        now.toLocaleDateString(),
        canvas.width / 2,
        totalHeight - 15
      );

      // Frame Overlay (if it's a full-image frame like Mofusand)
      if (
        [
          "mofusandImage",
          "shinChanImage",
          "miffyImage",
          "weddingImage",
          "markImage",
          "jellycatImage",
          "ksaImage",
        ].includes(selectedFrame)
      ) {
        frames[selectedFrame].draw(ctx, 0, 0, canvas.width, canvas.height);
      }
    };

    if (capturedImages.length === 0) {
      drawText();
      return;
    }

    const imagesToUse = capturedImages.slice(0, photoCount);
    let imagesLoaded = 0;

    imagesToUse.forEach((image, index) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        let x, y, w, h;

        // 4. Determine Position on Canvas
        if (layoutType === "layoutS") {
          x = borderSize;
          y = borderSize;
          w = imgWidth;
          h = imgWidth; // Square for single
        } else if (layoutType === "layoutD") {
          const col = index % 2;
          const row = Math.floor(index / 2);
          x = borderSize + col * (imgWidth + photoSpacing);
          y = borderSize + row * (imgHeight + photoSpacing);
          w = imgWidth;
          h = imgHeight;
        } else {
          x = borderSize;
          y = borderSize + (imgHeight + photoSpacing) * index;
          w = imgWidth;
          h = imgHeight;
        }

        // 5. ANTI-STRETCH LOGIC (Crop to Center)
        // We calculate source dimensions (sx, sy, sWidth, sHeight)
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let sx, sy, sWidth, sHeight;

        if (imgRatio > targetRatio) {
          // Image is wider than target -> Crop sides
          sHeight = img.height;
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          // Image is taller than target -> Crop top/bottom
          sWidth = img.width;
          sHeight = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }

        // Draw the cropped image
        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);

        // Draw Sticker Overlays on top of specific photo
        if (["pastel", "cute"].includes(selectedFrame)) {
          frames[selectedFrame].draw(ctx, x, y, w, h);
        }

        imagesLoaded++;
        if (imagesLoaded === imagesToUse.length) drawText();
      };

      img.onerror = () => {
        imagesLoaded++;
        if (imagesLoaded === imagesToUse.length) drawText();
      };
    });
  }, [capturedImages, stripColor, selectedFrame, layoutType, photoCount]);

  // Handle Rendering Trigger
  useEffect(() => {
    setTimeout(() => {
      generatePhotoStrip();
      if (!gifBlob && !isCreatingGif && capturedImages.length > 0)
        createGIF().catch(console.error);
    }, 100);
  }, [
    generatePhotoStrip,
    gifBlob,
    isCreatingGif,
    capturedImages.length,
    createGIF,
  ]);

  const downloadPhotoStrip = () => {
    const link = document.createElement("a");
    link.download = "SnapBunny.jpg";
    link.href = stripCanvasRef.current.toDataURL("image/jpeg", 0.9);
    link.click();
  };

  const handleQRClick = () => {
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://snapbunny.app&color=ff80ab`;
    setQrCodeUrl(qrApi);
  };

  return (
    <div
      className="photo-preview"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "40px",
        justifyContent: "center",
      }}
    >
      {/* Left: Preview */}
      <div
        style={{
          flex: "1 1 400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "#ff80ab", marginBottom: "20px" }}>
          Your Masterpiece
        </h2>
        <canvas
          ref={stripCanvasRef}
          style={{
            maxWidth: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            borderRadius: "5px",
          }}
        />

        {qrCodeUrl && (
          <div
            className="glass-panel"
            style={{
              marginTop: "20px",
              textAlign: "center",
              animation: "softFade 0.5s",
            }}
          >
            <img src={qrCodeUrl} alt="QR" style={{ borderRadius: "10px" }} />
            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
              Scan to Share!
            </p>
            <button
              onClick={() => setQrCodeUrl(null)}
              className="btn-secondary"
              style={{ marginTop: "10px" }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Right: Controls (Glass Panel) */}
      <div
        className="glass-panel"
        style={{ flex: "1 1 350px", minWidth: "300px" }}
      >
        {/* Colors */}
        <div className="control-group" style={{ marginBottom: "30px" }}>
          <div className="section-title">
            <Palette size={18} /> Frame Color
          </div>
          <div className="color-grid">
            {[
              "white",
              "black",
              "#f6d5da",
              "#dde6d5",
              "#adc3e5",
              "#FFF2CC",
              "#dbcfff",
              "#800000",
            ].map((color) => (
              <div
                key={color}
                className={`color-swatch ${
                  stripColor === color ? "active" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setStripColor(color)}
              />
            ))}
            {/* Hidden Custom Picker */}
            <label
              className="color-swatch"
              style={{
                background:
                  "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                type="color"
                style={{
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
                onChange={(e) => setStripColor(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Stickers */}
        <div className="control-group">
          <div className="section-title">
            <Smile size={18} /> Stickers & Frames
          </div>
          <div className="sticker-grid">
            {[
              { id: "none", label: "No Stickers" },
              { id: "pastel", label: "Girlypop" },
              { id: "cute", label: "Cute" },
              { id: "jellycatImage", label: "Jellycat" },
              { id: "mofusandImage", label: "Mofusand" },
              { id: "shinChanImage", label: "Shin Chan" },
              { id: "miffyImage", label: "Miffy" },
              { id: "markImage", label: "Mark's Debut" },
            ].map((sticker) => (
              <button
                key={sticker.id}
                className={`sticker-btn ${
                  selectedFrame === sticker.id ? "active" : ""
                }`}
                onClick={() => setSelectedFrame(sticker.id)}
              >
                {sticker.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="action-bar">
          <button className="btn-bunny btn-icon" onClick={downloadPhotoStrip}>
            <Download size={18} /> Save
          </button>
          <button className="btn-secondary btn-icon" onClick={handleQRClick}>
            <Share2 size={18} /> QR
          </button>
          <button
            className="btn-secondary btn-icon"
            onClick={() => navigate("/layout")}
          >
            <RefreshCw size={18} /> Retake
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;
