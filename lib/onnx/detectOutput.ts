import type { OutputTensor, Detection } from "./types";

function iou(a: Detection, b: Detection): number {
  const ax1 = a.x - a.width / 2;
  const ay1 = a.y - a.height / 2;
  const ax2 = a.x + a.width / 2;
  const ay2 = a.y + a.height / 2;
  const bx1 = b.x - b.width / 2;
  const by1 = b.y - b.height / 2;
  const bx2 = b.x + b.width / 2;
  const by2 = b.y + b.height / 2;

  const xi1 = Math.max(ax1, bx1);
  const yi1 = Math.max(ay1, by1);
  const xi2 = Math.min(ax2, bx2);
  const yi2 = Math.min(ay2, by2);
  const inter = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
  const areaA = (ax2 - ax1) * (ay2 - ay1);
  const areaB = (bx2 - bx1) * (by2 - by1);
  return inter / (areaA + areaB - inter + 1e-10);
}

function nms(detections: Detection[], iouThreshold: number): Detection[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const keep: Detection[] = [];
  for (const det of sorted) {
    if (keep.some((k) => k.classId === det.classId && iou(k, det) > iouThreshold)) continue;
    keep.push(det);
  }
  return keep;
}

function scaleBoxes(
  detections: Detection[],
  modelWidth: number,
  modelHeight: number,
  imageWidth: number,
  imageHeight: number,
  normalized: boolean,
): Detection[] {
  if (normalized) {
    return detections.map((d) => ({
      ...d,
      x: d.x * imageWidth,
      y: d.y * imageHeight,
      width: d.width * imageWidth,
      height: d.height * imageHeight,
    }));
  }

  const scale = Math.min(modelWidth / imageWidth, modelHeight / imageHeight);
  const padX = (modelWidth - imageWidth * scale) / 2;
  const padY = (modelHeight - imageHeight * scale) / 2;

  return detections.map((d) => ({
    ...d,
    x: (d.x - padX) / scale,
    y: (d.y - padY) / scale,
    width: d.width / scale,
    height: d.height / scale,
  }));
}

interface ParseOptions {
  confidenceThreshold?: number;
  iouThreshold?: number;
  modelWidth?: number;
  modelHeight?: number;
  imageWidth?: number;
  imageHeight?: number;
  labels?: string[];
}

export function parseDetections(
  output: OutputTensor,
  options: ParseOptions = {},
): Detection[] {
  const {
    confidenceThreshold = 0.25,
    iouThreshold = 0.45,
    modelWidth = 640,
    modelHeight = 640,
    imageWidth = 640,
    imageHeight = 640,
    labels = [],
  } = options;

  const shape = output.dims;
  const data = output.data;
  if (!shape || shape.length < 2) return [];

  const rows = shape.length === 3 ? shape[1] : shape[0];
  const cols = shape.length === 3 ? shape[2] : shape[1];
  if (rows === 0 || cols < 6) return [];

  const raw: Detection[] = [];

  if (cols === 6) {
    // [x1, y1, x2, y2, confidence, class_id]
    for (let i = 0; i < rows; i++) {
      const off = i * cols;
      const conf = data[off + 4];
      if (conf < confidenceThreshold) continue;
      const x1 = data[off];
      const y1 = data[off + 1];
      const x2 = data[off + 2];
      const y2 = data[off + 3];
      const classId = Math.round(data[off + 5]);
      raw.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: x2 - x1,
        height: y2 - y1,
        confidence: conf,
        classId,
        className: labels[classId],
      });
    }
  } else if (cols === 7) {
    // [batch_id, x1, y1, x2, y2, confidence, class_id]
    for (let i = 0; i < rows; i++) {
      const off = i * cols;
      const conf = data[off + 5];
      if (conf < confidenceThreshold) continue;
      const x1 = data[off + 1];
      const y1 = data[off + 2];
      const x2 = data[off + 3];
      const y2 = data[off + 4];
      const classId = Math.round(data[off + 6]);
      raw.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: x2 - x1,
        height: y2 - y1,
        confidence: conf,
        classId,
        className: labels[classId],
      });
    }
  } else if (cols === 84) {
    // [x1, y1, x2, y2, 80 class_probs] (YOLOv8 COCO raw)
    for (let i = 0; i < rows; i++) {
      const off = i * cols;
      let maxScore = 0;
      let classId = 0;
      for (let j = 4; j < cols; j++) {
        if (data[off + j] > maxScore) {
          maxScore = data[off + j];
          classId = j - 4;
        }
      }
      if (maxScore < confidenceThreshold) continue;
      const x1 = data[off];
      const y1 = data[off + 1];
      const x2 = data[off + 2];
      const y2 = data[off + 3];
      raw.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: x2 - x1,
        height: y2 - y1,
        confidence: maxScore,
        classId,
        className: labels[classId],
      });
    }
  } else if (cols === 85) {
    // [x1, y1, x2, y2, obj_conf, 80 class_probs] (YOLOv5 COCO)
    for (let i = 0; i < rows; i++) {
      const off = i * cols;
      let maxScore = 0;
      let classId = 0;
      for (let j = 5; j < cols; j++) {
        if (data[off + j] > maxScore) {
          maxScore = data[off + j];
          classId = j - 5;
        }
      }
      const objConf = data[off + 4];
      const conf = objConf * maxScore;
      if (conf < confidenceThreshold) continue;
      const x1 = data[off];
      const y1 = data[off + 1];
      const x2 = data[off + 2];
      const y2 = data[off + 3];
      raw.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: x2 - x1,
        height: y2 - y1,
        confidence: conf,
        classId,
        className: labels[classId],
      });
    }
  } else if (cols > 6) {
    // Generic: first 4 = box, rest = class scores
    // Check if there's an object confidence at position 4
    const sample = data.slice(0, cols);
    const hasObjConf = sample[4] >= 0 && sample[4] <= 1 && sample[5] >= 0 && sample[5] <= 1;

    for (let i = 0; i < rows; i++) {
      const off = i * cols;
      let maxScore = 0;
      let classId = 0;
      const scoreStart = hasObjConf ? 5 : 4;
      for (let j = scoreStart; j < cols; j++) {
        if (data[off + j] > maxScore) {
          maxScore = data[off + j];
          classId = j - scoreStart;
        }
      }
      const conf = hasObjConf ? data[off + 4] * maxScore : maxScore;
      if (conf < confidenceThreshold) continue;
      const x1 = data[off];
      const y1 = data[off + 1];
      const x2 = data[off + 2];
      const y2 = data[off + 3];
      raw.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: x2 - x1,
        height: y2 - y1,
        confidence: conf,
        classId,
        className: labels[classId],
      });
    }
  }

  // Check if boxes are normalized [0,1] or pixel coords
  const normalized = raw.length > 0 &&
    raw[0].x <= 1.01 && raw[0].y <= 1.01 &&
    raw[0].width <= 1.01 && raw[0].height <= 1.01;

  const scaled = scaleBoxes(raw, modelWidth, modelHeight, imageWidth, imageHeight, normalized);
  return nms(scaled, iouThreshold);
}
