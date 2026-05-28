"use client";

import { topK } from "@/lib/onnx/topK";
import { analyzeTensor } from "@/lib/onnx/analyzeTensor";
import type { OutputTensor } from "@/lib/onnx/types";

interface Props {
  outputs: OutputTensor[];
  labels: string[];
  inputName?: string;
  inputShape?: readonly (string | number | null)[];
}

const MAX_RAW_VALUES = 50;

function ConfidenceBar({ value, maxValue }: { value: number; maxValue: number }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="h-5 w-full rounded-full bg-black/40">
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
}: Props) {
  return (
    <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/[0.03] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-300">Inference Outputs</h2>
        <p className="mt-1 text-sm text-gray-400">
          Parsed ONNX Runtime output tensors
        </p>
      </div>

      {/* Inference Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-black/30 p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Input Tensor</div>
          <div className="mb-2 overflow-x-auto whitespace-nowrap font-mono text-sm text-cyan-300">
            {inputName || "unknown"}
          </div>
          <div className="font-mono text-xs text-gray-400">
            Shape: [{inputShape?.join(", ") || "unknown"}]
          </div>
        </div>
        <div className="rounded-2xl bg-black/30 p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Labels</div>
          <div className="font-mono text-sm text-green-300">
            {labels.length > 0 ? `${labels.length} loaded` : "No labels loaded"}
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-6">
        {outputs.map((output, index) => {
          const predictions = topK(output.data, 5);
          const analysis = analyzeTensor(output);
          const maxPred = predictions.length > 0 ? predictions[0].value : 1;

          const dataArray = Array.from(output.data);
          const showTruncated = dataArray.length > MAX_RAW_VALUES;

          return (
            <div key={index} className="rounded-2xl border border-white/5 bg-black/30 p-5">
              {/* Tensor Name */}
              <div className="mb-4">
                <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Output Tensor</div>
                <div className="overflow-x-auto whitespace-nowrap rounded-xl bg-black/40 px-3 py-2 font-mono text-sm text-cyan-300">
                  {output.name}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-black/40 p-4">
                  <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Tensor Type</div>
                  <div className="font-mono text-sm text-green-300">{output.type}</div>
                </div>
                <div className="rounded-xl bg-black/40 p-4">
                  <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Shape</div>
                  <div className="overflow-x-auto whitespace-nowrap font-mono text-sm text-blue-300">
                    [{output.dims.join(", ")}]
                  </div>
                </div>
              </div>

              {/* Tensor Analysis */}
              <div className="mb-6">
                <div className="mb-3 text-xs uppercase tracking-wide text-gray-500">Tensor Analysis</div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl bg-black/30 p-3">
                    <div className="mb-1 text-xs text-gray-500">Total</div>
                    <div className="font-mono text-cyan-300">{analysis.total}</div>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <div className="mb-1 text-xs text-gray-500">Min</div>
                    <div className="font-mono text-green-300">{analysis.min.toFixed(4)}</div>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <div className="mb-1 text-xs text-gray-500">Max</div>
                    <div className="font-mono text-yellow-300">{analysis.max.toFixed(4)}</div>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <div className="mb-1 text-xs text-gray-500">Mean</div>
                    <div className="font-mono text-pink-300">{analysis.mean.toFixed(4)}</div>
                  </div>
                </div>
              </div>

              {/* Top Predictions */}
              <div className="mb-6">
                <div className="mb-3 text-xs uppercase tracking-wide text-gray-500">Top Predictions</div>
                <div className="space-y-2">
                  {predictions.map((pred, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-2.5">
                      <span className="w-6 text-right font-mono text-xs text-gray-500">#{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="overflow-x-auto whitespace-nowrap font-mono text-sm text-cyan-300">
                          {labels[pred.index] || `Class ${pred.index}`}
                        </div>
                        <ConfidenceBar value={pred.value} maxValue={maxPred} />
                      </div>
                      <span className="shrink-0 font-mono text-sm text-green-300">
                        {pred.value.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Tensor Data */}
              <div>
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                  <span>Raw Tensor Data</span>
                  <span className="text-[10px] text-gray-600">{dataArray.length} values</span>
                </div>
                <pre className="max-h-[200px] overflow-auto rounded-2xl bg-black/50 p-4 font-mono text-xs leading-relaxed text-white/80">
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
