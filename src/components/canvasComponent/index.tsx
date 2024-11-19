"use client";
import { IconDownload } from "@/assets/IconDownload";
import Loader from "@/components/loader";
import React, { useRef, useState, useEffect } from "react";

export default function CanvasComponent() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loader, setLoader] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [previousPos, setPreviousPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoader(true);
    if (event.target.files && event.target.files[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(event.target.files[0]);
      img.onload = () => setImage(img);
    }
  };

  useEffect(() => {
    if (image) {
      setLoader(false);
    }
  }, [image]);

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (image) {
        // ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Canvas'ı temizleyip görseli tekrar çiziyoruz
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (canvas && ctx && image) {
          ctx.strokeStyle = "rgba(0, 255, 0)";
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Görüntüyü 'contain' modunda ölçeklendirmek için oranları hesapla
          const canvasAspect = canvas.width / canvas.height;
          const imageAspect = image.width / image.height;

          let renderWidth, renderHeight;
          if (imageAspect > canvasAspect) {
            // Genişlik daha büyükse, genişliğe sığdır
            renderWidth = canvas.width;
            renderHeight = canvas.width / imageAspect;
          } else {
            // Yükseklik daha büyükse, yüksekliğe sığdır
            renderWidth = canvas.height * imageAspect;
            renderHeight = canvas.height;
          }

          // Merkeze konumlandırmak için pozisyonu hesapla
          const offsetX = (canvas.width - renderWidth) / 2;
          const offsetY = (canvas.height - renderHeight) / 2;

          // Görüntüyü canvasa çiz
          ctx.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedTool) return;

    clearCanvas(); // Yeni çizime başlamadan önce önceki çizimi siliyoruz

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsDrawing(true);
    setCurrentPos(null);
    setPreviousPos({ x, y }); // İlk tıklanan pozisyonu previousPos olarak ayarla

    if (selectedTool === "draw" || selectedTool === "freeSelect") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !isDrawing || !selectedTool) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPos({ x, y });
    if (selectedTool === "squareSelect" && startPos) {
      clearCanvas();
      const width = x - startPos.x;
      const height = y - startPos.y;

      // Saydam yeşil renkte dolgu yapıyoruz
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 255, 0)"; // Çerçeve rengi yeşil
      ctx.fillStyle = "rgba(0, 255, 0, 0.4)"; // Saydam yeşil dolgu
      ctx.globalAlpha = 0.4; // Opaklık ayarı
      ctx.fillRect(startPos.x, startPos.y, width, height); // Alanı dolduruyoruz
      ctx.strokeRect(startPos.x, startPos.y, width, height); // Çerçeve çiziyoruz

      ctx.globalAlpha = 1.0; // Opaklığı eski haline getiriyoruz
      ctx.setLineDash([]); // Çizgi stilini sıfırlıyoruz
    }
    if (selectedTool === "draw") {
      // Daha önceki noktaya doğru çizgi çek
      ctx.beginPath();
      if (previousPos) {
        ctx.moveTo(previousPos.x, previousPos.y);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(0, 255, 0, 0.3)"; // Opaklığı %10 olarak ayarla
      ctx.lineWidth = 20; // Çizgi kalınlığını ayarla
      ctx.lineCap = "round"; // Çizgi uçlarını yuvarla
      ctx.stroke();
      ctx.closePath();

      // Yeni önceki nokta olarak güncelle
      setPreviousPos({ x, y });
    } else if (selectedTool === "freeSelect") {
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(0, 255, 0)";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !isDrawing || !selectedTool) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (selectedTool === "squareSelect" && startPos && currentPos) {
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, width, height); // Kalıcı kare çizimi
    } else if (selectedTool === "freeSelect" && startPos) {
      ctx.lineTo(startPos.x, startPos.y);
      ctx.stroke();
      ctx.closePath();
      // Serbest çizimi yeşil renkle doldurma
      ctx.globalAlpha = 0.4; // Opaklığı 0.4 olarak ayarlıyoruz
      ctx.fillStyle = "rgba(0, 255, 0)"; // Dolgu rengi olarak yeşil seçiyoruz
      ctx.fill(); // Serbest seçim alanını dolduruyoruz
      ctx.globalAlpha = 1.0; // Opaklığı varsayılana döndürüyoruz
    }
    setIsDrawing(false);
    setCurrentPos(null); // Geçici kareyi temizlemek için
  };

  useEffect(() => {
    if (typeof window !== "undefined" && canvasRef.current && image) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx && image) {
        ctx.strokeStyle = "rgba(0, 255, 0)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Görüntüyü 'contain' modunda ölçeklendirmek için oranları hesapla
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = image.width / image.height;

        let renderWidth, renderHeight;
        if (imageAspect > canvasAspect) {
          renderWidth = canvas.width;
          renderHeight = canvas.width / imageAspect;
        } else {
          renderWidth = canvas.height * imageAspect;
          renderHeight = canvas.height;
        }

        const offsetX = (canvas.width - renderWidth) / 2;
        const offsetY = (canvas.height - renderHeight) / 2;

        ctx.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);
      }
    }
  }, [image]);

  const exportImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Yeni bir canvas oluştur (500x500 boyutunda)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 500;
    exportCanvas.height = 500;
    const exportCtx = exportCanvas.getContext("2d");

    if (exportCtx) {
      // 1. Yeni canvas'a siyah arka plan ekle
      exportCtx.fillStyle = "black";
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 2. Yalnızca çizimlerin olduğu kısmı kopyala, orijinal görseli değil
      if (ctx) {
        // Görüntü haricindeki çizimleri almak için sadece şekilleri kopyalayacağız
        exportCtx.globalCompositeOperation = "source-over"; // Sadece çizimler üstte görünsün
        exportCtx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height, // Orijinal canvas'tan alınacak alan
          0,
          0,
          exportCanvas.width,
          exportCanvas.height // Yeni canvas'a kopyalanacak alanın boyutları
        );
      }

      // 3. Görseli base64 formatında al
      const dataURL = exportCanvas.toDataURL("image/png");

      // 4. Link ile görseli indir
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "exported-image.png";
      a.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white min-h-[100vh]">
      <Loader loading={loader} />
      {image ? (
        <div className="relative flex flex-col justify-center items-center gap-10">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />

          <div className="flex justify-center items-center gap-[4px] space-x-2 mb-4 bg-black px-4 py-2 rounded-lg w-fit shadow-md shadow-gray-500">
            <button
              onClick={() => handleToolChange("freeSelect")}
              className={`relative flex justify-center items-center w-20 h-10 bg-black text-white text-xs w-[100px] after:absolute after:content-[""] after:w-[1px] after:h-[50%] after:top-[50%]  after:translate-y-[-50%] after:right-[-7px] after:bg-gray-500  ${
                selectedTool === "freeSelect"
                  ? "border border-solid border-green-500"
                  : "border border-solid border-transparent"
              }`}
            >
              Lasso
            </button>
            <button
              onClick={() => handleToolChange("draw")}
              className={`relative bg-black flex justify-center items-center w-20 h-10 text-white text-xs w-[100px] after:absolute after:content-[""] after:w-[1px] after:h-[50%] after:top-[50%] after:translate-y-[-50%] after:right-[-7px] after:bg-gray-500 ${
                selectedTool === "draw"
                  ? "border border-solid border-green-500"
                  : "border border-solid border-transparent"
              }`}
            >
              Brush
            </button>
            <button
              onClick={() => handleToolChange("squareSelect")}
              className={`flex justify-center items-center w-20 h-10 bg-black text-white w-[100px] text-xs  ${
                selectedTool === "squareSelect"
                  ? "border border-solid border-green-500"
                  : "border border-solid border-transparent"
              }`}
            >
              Rectangel
            </button>
          </div>

          <div
            onClick={exportImage}
            className="absolute cursor-pointer top-0 right-[-100px] flex flex-col gap-1 justify-center items-center w-20 h-20 bg-red-800 text-white rounded-[50%]"
          >
            <span className="text-xs">Export</span>
            <IconDownload width={20} height={20} />
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-6 py-3 bg-black text-white shadow-md hover:scale-95"
          >
            Add Photo
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
