"use client";

import { useState, useRef } from "react";

import { detectInputType } from "@/lib/onnx/inputType";
import { imageToTensor } from "@/lib/onnx/imageTensor";
import { runInference } from "@/lib/onnx/runInference";
import { parseOutputs } from "@/lib/onnx/parseOutputs";

import OutputViewer from "./OutputViewer";
import type { OutputTensor } from "@/lib/onnx/types";

interface InputMetadata {
  name: string;
  shape?: readonly (number | string | null)[];
  isTensor: boolean;
  type?: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function InputPanel({ session }: Props) {
  const [outputs, setOutputs] = useState<OutputTensor[] | null>(null);
  const [running, setRunning] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [inferenceError, setInferenceError] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageInputRef = useRef<HTMLInputElement>(null);

  const prevUrlRef = useRef("");

  if (!session) {
    return null;
  }

  async function handleImageInference(file: File, meta: InputMetadata) {
    setInferenceError("");
    try {
      setRunning(true);
      const shape = meta.shape ?? [];
      const height = Number(shape[2]) || 224;
      const width = Number(shape[3]) || 224;

      // Revoke previous URL
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

      const url = URL.createObjectURL(file);
      prevUrlRef.current = url;
      setImageUrl(url);

      // Get original image dimensions
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Failed to load image"));
        el.src = url;
      });
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      const tensor = await imageToTensor(file, width, height);
      const results = await runInference(session, meta.name, tensor);
      const parsed = parseOutputs(results);
      setOutputs(parsed);
    } catch (error) {
      console.error(error);
      setInferenceError(error instanceof Error ? error.message : "Inference failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 text-white shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Run Inference</h2>
        <p className="mt-1 text-sm text-gray-400">
          Provide input data to run the model
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {session.inputMetadata?.map((meta: InputMetadata, index: number) => {
          const shape = meta.shape || [];
          const inputType = detectInputType(shape);

          return (
            <div
              key={index}
              className={`rounded-2xl border p-5 transition ${
                running ? "border-white/5 opacity-50" : "border-white/5 bg-black/20"
              }`}
            >
              {/* Name + Type + Shape row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="overflow-x-auto whitespace-nowrap rounded-lg bg-black/40 px-3 py-2 font-mono text-sm text-cyan-300">
                  {meta.name}
                </div>
                <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-[11px] text-green-300">
                  {meta.type || "unknown"}
                </span>
                <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-[11px] text-blue-300">
                  [{shape.length ? shape.join(", ") : "unknown"}]
                </span>
              </div>

              {/* IMAGE INPUT */}
              {inputType === "image" && (
                <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.03] p-5">
                  <div className="mb-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Inference Image
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      disabled={running}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleImageInference(file, meta);
                      }}
                      className="block w-full text-sm text-gray-400 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:transition hover:file:bg-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Optional Labels JSON
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      disabled={running}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const parsed = JSON.parse(text);
                          setLabels(parsed);
                        } catch {
                          setInferenceError("Invalid JSON file");
                        }
                      }}
                      className="block w-full text-sm text-gray-400 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:transition hover:file:bg-blue-500 disabled:opacity-50"
                    />
                    {labels.length > 0 && (
                      <div className="mt-3 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm text-green-300">
                        Loaded <span className="font-semibold">{labels.length}</span> labels
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VECTOR INPUT */}
              {inputType === "vector" && (
                <textarea
                  disabled={running}
                  placeholder="0.1, 0.2, 0.3, ..."
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:opacity-50"
                />
              )}

              {/* GENERIC TENSOR */}
              {inputType === "tensor" && (
                <textarea
                  disabled={running}
                  placeholder="Tensor values..."
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:opacity-50"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Inference Error */}
      {inferenceError && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {inferenceError}
        </div>
      )}

      {/* Running indicator */}
      {running && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] px-5 py-4 text-sm text-cyan-300">
          <Spinner />
          Running inference...
        </div>
      )}

      {/* Outputs */}
      {outputs && (
        <OutputViewer
          outputs={outputs}
          labels={labels}
          imageUrl={imageUrl}
          imageWidth={imageSize.width}
          imageHeight={imageSize.height}
          inputName={session.inputMetadata?.[0]?.name}
          inputShape={session.inputMetadata?.[0]?.shape}
        />
      )}
    </div>
  );
}
