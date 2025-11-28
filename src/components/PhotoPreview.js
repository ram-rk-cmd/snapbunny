import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GIF from "gif.js";
import {
  Download,
  Share2,
  RefreshCw,
  Palette,
  Smile,
  ImagePlus,
  Trash2,
  Sliders,
  Type,
  Copy,
} from "lucide-react";

/* --- HELPER: FRAME DRAWING (ANTI-STRETCH) --- */
const drawFrame = (ctx, canvas, src) => {
  const frameImg = new Image();
  frameImg.src = src;
  frameImg.onload = () => {
    const hRatio = canvas.width / frameImg.width;
    const vRatio = canvas.height / frameImg.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - frameImg.width * ratio) / 2;
    const centerShift_y = (canvas.height - frameImg.height * ratio) / 2;

    ctx.drawImage(
      frameImg,
      0,
      0,
      frameImg.width,
      frameImg.height,
      centerShift_x,
      centerShift_y,
      frameImg.width * ratio,
      frameImg.height * ratio
    );
  };
};

/* --- HELPER: SEEDED RANDOM --- */
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/* --- FRAMES COLLECTION --- */
const frames = {
  none: { draw: () => {} },

  // Girly Pop (Border Emojis - Static)
  pastel: {
    draw: (ctx, x, y, width, height) => {
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const emojis = ["🎀", "🌸", "✨", "☁️", "💖", "🧸", "🍓"];
      const spacing = 45;
      for (let i = x; i <= x + width; i += spacing) {
        ctx.fillText(
          emojis[Math.floor(Math.random() * emojis.length)],
          i,
          y + 15
        );
        ctx.fillText(
          emojis[Math.floor(Math.random() * emojis.length)],
          i,
          y + height - 15
        );
      }
      for (let i = y; i <= y + height; i += spacing) {
        ctx.fillText(
          emojis[Math.floor(Math.random() * emojis.length)],
          x + 15,
          i
        );
        ctx.fillText(
          emojis[Math.floor(Math.random() * emojis.length)],
          x + width - 15,
          i
        );
      }
    },
  },

  // Random Scattered Emojis (Handled via Stickers now)
  randomPop: {
    draw: () => {},
  },

  // Cute Frame with Symbols
  cute: {
    draw: (ctx, x, y, width, height) => {
      // Helper to draw hearts
      const drawHeart = (hx, hy, size, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(hx, hy + topCurveHeight);
        ctx.bezierCurveTo(
          hx,
          hy,
          hx - size / 2,
          hy,
          hx - size / 2,
          hy + topCurveHeight
        );
        ctx.bezierCurveTo(
          hx - size / 2,
          hy + (size + topCurveHeight) / 2,
          hx,
          hy + (size + topCurveHeight) / 2,
          hx,
          hy + size
        );
        ctx.bezierCurveTo(
          hx,
          hy + (size + topCurveHeight) / 2,
          hx + size / 2,
          hy + (size + topCurveHeight) / 2,
          hx + size / 2,
          hy + topCurveHeight
        );
        ctx.bezierCurveTo(hx + size / 2, hy, hx, hy, hx, hy + topCurveHeight);
        ctx.fill();
      };

      drawHeart(x + 20, y + 20, 25, "#FF69B4");
      drawHeart(x + width - 45, y + height - 45, 25, "#FF69B4");
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x + width - 30, y + 30, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#87CEEB";
      ctx.beginPath();
      ctx.arc(x + 40, y + height - 30, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 55, y + height - 35, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 25, y + height - 35, 12, 0, Math.PI * 2);
      ctx.fill();
    },
  },

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
  const stickerInputRef = useRef(null);
  const navigate = useNavigate();

  // State
  const [stripColor, setStripColor] = useState("white");
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [userEmojis, setUserEmojis] = useState("🌸,✨,🎀,💖,🦋,🐻,🍭,☁️");
  const [footerText, setFooterText] = useState("SnapBunny");
  const [stickers, setStickers] = useState([]); // Array of sticker objects
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isCreatingGif, setIsCreatingGif] = useState(false);
  const [gifBlob, setGifBlob] = useState(null);

  // Drag State
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  const layoutType = selectedLayout ? selectedLayout.type : "layoutA";
  const photoCount = selectedLayout ? selectedLayout.poses : 4;

  // --- STICKER HANDLERS ---
  const handleStickerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newId = Date.now();
          setStickers((prev) => [
            ...prev,
            {
              id: newId,
              type: "image",
              content: img,
              x: 50,
              y: 50,
              width: 100,
              height: 100 * (img.height / img.width),
            },
          ]);
          setSelectedStickerId(newId);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addRandomStickers = () => {
    const emojis = userEmojis.split(",").filter((e) => e.trim() !== "");
    if (emojis.length === 0) return;

    // Use canvas dimensions or fallback
    const canvas = stripCanvasRef.current;
    const w = canvas ? canvas.width : 400;
    const h = canvas ? canvas.height : 600;

    const count = 5 + Math.floor(Math.random() * 4); // 5 to 8
    const newStickers = [];

    for (let i = 0; i < count; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      newStickers.push({
        id: Date.now() + i,
        type: "text",
        content: emoji,
        x: 40 + Math.random() * (w - 80),
        y: 40 + Math.random() * (h - 80),
        width: 40, // Base size for text
        height: 40,
      });
    }
    setStickers((prev) => [...prev, ...newStickers]);
  };

  const deleteSticker = () => {
    if (selectedStickerId) {
      setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
      setSelectedStickerId(null);
    }
  };

  const duplicateSticker = () => {
    if (selectedStickerId) {
      const stickerToClone = stickers.find((s) => s.id === selectedStickerId);
      if (stickerToClone) {
        const newId = Date.now();
        setStickers((prev) => [
          ...prev,
          {
            ...stickerToClone,
            id: newId,
            x: stickerToClone.x + 20,
            y: stickerToClone.y + 20,
          },
        ]);
        setSelectedStickerId(newId);
      }
    }
  };

  const updateStickerSize = (newSize) => {
    if (selectedStickerId) {
      setStickers((prev) =>
        prev.map((s) => {
          if (s.id === selectedStickerId) {
            if (s.type === "image") {
              const ratio = s.height / s.width;
              return { ...s, width: newSize, height: newSize * ratio };
            } else {
              // For text, width acts as fontSize
              return { ...s, width: newSize, height: newSize };
            }
          }
          return s;
        })
      );
    }
  };

  // --- CANVAS INTERACTION (DRAG) ---
  const handleMouseDown = (e) => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check hit from top to bottom (reverse loop)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      // Let's standardise: x,y is Top-Left for hit detection
      if (
        clickX >= s.x &&
        clickX <= s.x + s.width &&
        clickY >= s.y &&
        clickY <= s.y + s.height
      ) {
        setSelectedStickerId(s.id);
        setDragState({
          isDragging: true,
          startX: clickX - s.x,
          startY: clickY - s.y,
        });
        return;
      }
    }
    setSelectedStickerId(null);
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging || !selectedStickerId) return;
    const canvas = stripCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setStickers((prev) =>
      prev.map((s) => {
        if (s.id === selectedStickerId) {
          return {
            ...s,
            x: mouseX - dragState.startX,
            y: mouseY - dragState.startY,
          };
        }
        return s;
      })
    );
  };

  const handleMouseUp = () => {
    setDragState({ ...dragState, isDragging: false });
  };

  // --- GIF LOGIC ---
  const createGIF = useCallback(async () => {
    if (capturedImages.length === 0 || isCreatingGif || gifBlob) return gifBlob;
    setIsCreatingGif(true);
    return new Promise((resolve, reject) => {
      try {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: 300,
          height: 533,
          workerScript: "/gif.worker.js",
        });
        let imagesLoaded = 0;
        capturedImages.forEach((imageUrl) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 300;
            canvas.height = 533;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = stripColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              centerShift_x,
              centerShift_y,
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

            // Note: Stickers not drawn in GIF for simplicity (requires coordinate mapping)

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

  // --- RENDER LOGIC ---
  const generatePhotoStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const imgWidth = 400,
      imgHeight = 300,
      borderSize = 40,
      photoSpacing = 20,
      textHeight = 60;

    let totalHeight;
    if (layoutType === "layoutS") {
      canvas.width = imgWidth + borderSize * 2;
      totalHeight = imgWidth + borderSize * 2 + textHeight + 40;
    } else if (layoutType === "layoutD") {
      totalHeight =
        imgHeight * 3 + photoSpacing * 2 + borderSize * 2 + textHeight;
      canvas.width = imgWidth * 2 + photoSpacing + borderSize * 2;
    } else {
      const rows = photoCount;
      totalHeight =
        imgHeight * rows +
        photoSpacing * (rows - 1) +
        borderSize * 2 +
        textHeight;
      canvas.width = imgWidth + borderSize * 2;
    }
    canvas.height = totalHeight;

    ctx.fillStyle = stripColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawText = () => {
      const now = new Date();
      ctx.fillStyle =
        stripColor === "black" || stripColor === "#800000"
          ? "#FFFFFF"
          : "#5d4037";
      ctx.font = "bold 22px Quicksand";
      ctx.textAlign = "center";
      ctx.fillText(footerText, canvas.width / 2, totalHeight - 35);

      ctx.font = "14px Quicksand";
      ctx.fillStyle =
        stripColor === "black" || stripColor === "#800000" ? "#bbb" : "#888";
      ctx.fillText(
        now.toLocaleDateString(),
        canvas.width / 2,
        totalHeight - 15
      );
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

      // Draw Stickers (Image or Text)
      stickers.forEach((s) => {
        if (s.type === "image") {
          ctx.drawImage(s.content, s.x, s.y, s.width, s.height);
        } else {
          // Text Sticker (Emoji)
          ctx.font = `${s.width}px Arial`; // Use width as font-size proxy
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(s.content, s.x, s.y);
        }

        // Selection Border
        if (s.id === selectedStickerId) {
          ctx.strokeStyle = "#ff80ab";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(s.x, s.y, s.width, s.height);
          ctx.setLineDash([]);
        }
      });
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
        if (layoutType === "layoutS") {
          x = borderSize;
          y = borderSize;
          w = imgWidth;
          h = imgWidth;
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

        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let sx, sy, sWidth, sHeight;
        if (imgRatio > targetRatio) {
          sHeight = img.height;
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        if (["pastel", "cute"].includes(selectedFrame))
          frames[selectedFrame].draw(ctx, x, y, w, h);
        imagesLoaded++;
        if (imagesLoaded === imagesToUse.length) drawText();
      };
    });
  }, [
    capturedImages,
    stripColor,
    selectedFrame,
    layoutType,
    photoCount,
    stickers,
    selectedStickerId,
    footerText,
  ]);

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
  const downloadGIF = async () => {
    if (gifBlob) {
      const link = document.createElement("a");
      link.download = "SnapBunny.gif";
      link.href = URL.createObjectURL(gifBlob);
      link.click();
    } else {
      alert("GIF is generating...");
    }
  };
  const handleQRClick = () => {
    setQrCodeUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://snapbunny.vercel.app&color=ff80ab`
    );
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            maxWidth: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            borderRadius: "5px",
            cursor: selectedStickerId ? "move" : "default",
          }}
        />

        {qrCodeUrl && (
          <div
            className="glass-panel"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            <img src={qrCodeUrl} alt="QR" style={{ borderRadius: "10px" }} />
            <p style={{ marginTop: "5px" }}>Scan to Share!</p>
            <button
              onClick={() => setQrCodeUrl(null)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        )}
      </div>

      <div
        className="glass-panel"
        style={{ flex: "1 1 350px", minWidth: "300px" }}
      >
        {/* Custom Text Input */}
        <div className="control-group" style={{ marginBottom: "20px" }}>
          <div className="section-title">
            <Type size={18} /> Footer Text
          </div>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            maxLength={25}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              outline: "none",
            }}
            placeholder="Enter text..."
          />
        </div>

        {/* Custom Frame Color */}
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
            ].map((c) => (
              <div
                key={c}
                className={`color-swatch ${stripColor === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setStripColor(c)}
              />
            ))}
            <label
              className="color-swatch"
              style={{
                background:
                  "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Custom Color"
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

        <div className="control-group">
          <div className="section-title">
            <Smile size={18} /> Frames
          </div>
          <div className="sticker-grid">
            {[
              { id: "none", label: "None" },
              { id: "pastel", label: "Pastel" },
              { id: "randomPop", label: "Random Emojis" },
              { id: "cute", label: "Cute" },
              { id: "mofusandImage", label: "Mofusand" },
              { id: "shinChanImage", label: "Shin Chan" },
              { id: "miffyImage", label: "Miffy" },
              { id: "jellycatImage", label: "Jellycat" },
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

        {selectedFrame === "randomPop" && (
          <div
            className="control-group"
            style={{
              marginTop: "15px",
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Choose Emojis:
            </label>
            <input
              type="text"
              value={userEmojis}
              onChange={(e) => setUserEmojis(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <button
              className="btn-secondary"
              style={{ width: "100%", marginTop: "10px" }}
              onClick={addRandomStickers}
            >
              Scatter Emojis! ✨
            </button>
          </div>
        )}

        {/* Custom Sticker Upload */}
        <div className="control-group" style={{ marginTop: "20px" }}>
          <div className="section-title">
            <ImagePlus size={18} /> Add Custom Stickers
          </div>

          {/* Sticker Controls Moved Here */}
          {selectedStickerId && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                background: "#fff0f5",
                padding: "10px",
                borderRadius: "15px",
                border: "1px solid #ff80ab",
              }}
            >
              <Sliders size={16} color="#666" />
              <input
                type="range"
                min="20"
                max="300"
                value={
                  stickers.find((s) => s.id === selectedStickerId)?.width || 100
                }
                onChange={(e) => updateStickerSize(parseInt(e.target.value))}
                style={{ accentColor: "#ff80ab", cursor: "pointer", flex: 1 }}
              />
              <button
                onClick={duplicateSticker}
                className="btn-icon"
                title="Duplicate"
                style={{ color: "#555" }}
              >
                <Copy size={18} />
              </button>
              <button
                onClick={deleteSticker}
                className="btn-icon"
                title="Delete"
                style={{ color: "#ff4d4d" }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="file"
              ref={stickerInputRef}
              onChange={handleStickerUpload}
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
            />
            <button
              className="btn-secondary"
              style={{ width: "100%" }}
              onClick={() => stickerInputRef.current.click()}
            >
              + Upload PNG / Photo
            </button>
          </div>
        </div>

        <div className="action-bar">
          <button className="btn-bunny btn-icon" onClick={downloadPhotoStrip}>
            <Download size={18} /> Save
          </button>
          <button
            className="btn-secondary btn-icon"
            onClick={downloadGIF}
            disabled={!gifBlob}
          >
            GIF
          </button>
          <button className="btn-secondary btn-icon" onClick={handleQRClick}>
            <Share2 size={18} /> QR
          </button>
          <button
            className="btn-secondary btn-icon"
            onClick={() => navigate("/printit")}
          >
            <RefreshCw size={18} /> Retake
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;
