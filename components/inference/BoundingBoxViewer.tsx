"use client";

import { useRef, useEffect, useState } from "react";
import type { Detection } from "@/lib/onnx/types";

interface Props {
  imageUrl: string;
  detections: Detection[];
  confidenceThreshold: number;
  onChangeThreshold: (t: number) => void;
}

const COLORS = [
  "#FF3838", "#FF9D00", "#FFD726", "#32CD32", "#00D4FF",
  "#7A81FF", "#FF6CB6", "#98FB98", "#E6A100", "#00E5FF",
  "#ADFF2F", "#FF69B4", "#BA55D3", "#00CED1", "#FF4500",
  "#7CFC00", "#FFD700", "#6495ED", "#DC143C", "#00FA9A",
];

function classColor(id: number): string {
  return COLORS[id % COLORS.length];
}

export default function BoundingBoxViewer({
  imageUrl,
  detections,
  confidenceThreshold,
  onChangeThreshold,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  // Load image and get its dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Observe container width for responsive canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerWidth || !imageSize.width) return;

    const scale = containerWidth / imageSize.width;
    const displayHeight = imageSize.height * scale;

    canvas.width = containerWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, containerWidth, displayHeight);

      const filtered = detections.filter((d) => d.confidence >= confidenceThreshold);

      for (const det of filtered) {
        const x = det.x * scale;
        const y = det.y * scale;
        const w = det.width * scale;
        const h = det.height * scale;
        const color = classColor(det.classId);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);

        ctx.fillStyle = color + "22";
        ctx.fillRect(x - w / 2, y - h / 2, w, h);

        const label = det.className ?? `class ${det.classId}`;
        const text = `${label} ${(det.confidence * 100).toFixed(1)}%`;
        ctx.font = "bold 14px monospace";
        const textW = ctx.measureText(text).width;

        const lx = x - w / 2;
        const ly = y - h / 2 - 20;

        ctx.fillStyle = color;
        ctx.fillRect(lx, ly, textW + 8, 20);

        ctx.fillStyle = "#fff";
        ctx.fillText(text, lx + 4, ly + 14);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, detections, confidenceThreshold, containerWidth, imageSize]);

  const filteredCount = detections.filter((d) => d.confidence >= confidenceThreshold).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-gray-400">
          {filteredCount} / {detections.length} detections
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-gray-500">
            Conf: {confidenceThreshold.toFixed(2)}
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={confidenceThreshold}
            onChange={(e) => onChangeThreshold(parseFloat(e.target.value))}
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-gray-700 accent-cyan-400"
          />
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden rounded-2xl bg-black/40">
        <canvas ref={canvasRef} className="block w-full" />
      </div>
    </div>
  );
}
