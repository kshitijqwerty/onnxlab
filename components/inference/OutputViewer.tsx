"use client";

import { useState } from "react";
import { topK } from "@/lib/onnx/topK";
import { analyzeTensor } from "@/lib/onnx/analyzeTensor";
import { parseDetections } from "@/lib/onnx/detectOutput";
import BoundingBoxViewer from "./BoundingBoxViewer";
import type { OutputTensor } from "@/lib/onnx/types";

interface Props {
  outputs: OutputTensor[];
  labels: string[];
  inputName?: string;
  inputShape?: readonly (string | number | null)[];
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const MAX_RAW_VALUES = 50;

function ConfidenceBar({ value, maxValue }: { value: number; maxValue: number }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="h-5 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-300 transition-all"
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  );
}

export default function OutputViewer({
  outputs,
  labels,
  inputName,
  inputShape,
  imageUrl,
  imageWidth,
  imageHeight,
}: Props) {
  const [confThreshold, setConfThreshold] = useState(0.25);

  const analyses = outputs.map((o) => ({ output: o, analysis: analyzeTensor(o) }));
  const isDetection = analyses.some((a) => a.analysis.isDetection);

  const modelW = inputShape && Number(inputShape[3]) ? Number(inputShape[3]) : 640;
  const modelH = inputShape && Number(inputShape[2]) ? Number(inputShape[2]) : 640;

  const detections = isDetection && imageUrl
    ? analyses.flatMap(({ output }) =>
        parseDetections(output, {
          confidenceThreshold: confThreshold,
          labels,
          modelWidth: modelW,
          modelHeight: modelH,
          imageWidth: imageWidth ?? modelW,
          imageHeight: imageHeight ?? modelH,
        }),
      )
    : [];

  return (
    <div className="mt-6 max-w-full space-y-4">
      {/* Detection visualization */}
      {isDetection && imageUrl && detections.length > 0 && (
        <BoundingBoxViewer
          imageUrl={imageUrl}
          detections={detections}
          confidenceThreshold={confThreshold}
          onChangeThreshold={setConfThreshold}
        />
      )}

      {/* Inference Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">Input Tensor</div>
          <div className="overflow-x-auto whitespace-nowrap font-mono text-sm text-cyan-300">
            {inputName || "unknown"}
          </div>
          <div className="font-mono text-[10px] text-gray-500">
            [{inputShape?.join(", ") || "unknown"}]
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">Labels</div>
          <div className="font-mono text-sm text-green-300">
            {labels.length > 0 ? `${labels.length} loaded` : "No labels loaded"}
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        {outputs.map((output, index) => {
          const predictions = topK(output.data, 5);
          const analysis = analyses[index].analysis;
          const maxPred = predictions.length > 0 ? predictions[0].value : 1;

          const dataArray = Array.from(output.data);
          const showTruncated = dataArray.length > MAX_RAW_VALUES;

          return (
            <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              {/* Header row: name + type + shape */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="overflow-x-auto whitespace-nowrap rounded-lg bg-black/40 px-2.5 py-1 font-mono text-sm text-cyan-300">
                  {output.name}
                </span>
                <span className="rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-green-300">{output.type}</span>
                <span className="rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">
                  [{output.dims.join(", ")}]
                </span>
                {analysis.isDetection && (
                  <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] text-rose-300">detection</span>
                )}
              </div>

              {!analysis.isDetection && (
                <>
                  {/* Stats row */}
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {[
                      { label: "Total", value: analysis.total, color: "text-cyan-300" },
                      { label: "Min", value: analysis.min.toFixed(4), color: "text-green-300" },
                      { label: "Max", value: analysis.max.toFixed(4), color: "text-yellow-300" },
                      { label: "Mean", value: analysis.mean.toFixed(4), color: "text-pink-300" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-black/30 px-2.5 py-2 text-center">
                        <div className="text-[10px] text-gray-500">{stat.label}</div>
                        <div className={`font-mono text-xs ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top-5 Predictions */}
                  <div className="mb-3">
                    <div className="mb-2 text-[10px] uppercase tracking-wide text-gray-500">Top Predictions</div>
                    <div className="space-y-1.5">
                      {predictions.map((pred, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                          <span className="w-5 shrink-0 text-right font-mono text-[10px] text-gray-500">{idx + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="overflow-x-auto whitespace-nowrap font-mono text-xs text-cyan-300">
                              {labels[pred.index] || `Class ${pred.index}`}
                            </div>
                            <ConfidenceBar value={pred.value} maxValue={maxPred} />
                          </div>
                          <span className="shrink-0 font-mono text-xs text-green-300">{pred.value.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Raw Tensor Data */}
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-500">
                  <span>Raw Data</span>
                  <span className="text-gray-600">{dataArray.length} values</span>
                </div>
                <pre className="max-h-[160px] overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-white/60">
                  {showTruncated
                    ? `[${dataArray.slice(0, MAX_RAW_VALUES).join(", ")}, ... ${dataArray.length - MAX_RAW_VALUES} more]`
                    : JSON.stringify(output.data, null, 2)}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
