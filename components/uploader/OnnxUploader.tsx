"use client";

import * as ort from "onnxruntime-web";
import { useState, useEffect, useCallback } from "react";
import { parseOnnxModel } from "@/lib/onnx/parser";
import type { ParsedModel, ParsedInput } from "@/lib/onnx/parser";
import { buildGraph } from "@/lib/onnx/graph";
import type { GraphResult } from "@/lib/onnx/graph";
import ModelGraph from "@/components/graph/ModelGraph";
import { parseGraph } from "@/lib/onnx/graphParser";
import { createSession } from "@/lib/onnx/inference";
import InputPanel from "@/components/inference/InputPanel";
import { checkWebGPU } from "@/lib/onnx/checkWebGpu";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function OnnxUploader() {
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ParsedModel | null>(null);
  const [graph, setGraph] = useState<GraphResult | null>(null);
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [gpuEnabled, setGpuEnabled] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    checkWebGPU().then(setGpuEnabled);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    if (!file.name.toLowerCase().endsWith(".onnx")) {
      setError("Please select a valid .onnx file");
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();

      const [runtimeSession, parsed, realGraph] = await Promise.all([
        createSession(arrayBuffer),
        parseOnnxModel(arrayBuffer),
        parseGraph(arrayBuffer),
      ]);

      setSession(runtimeSession);
      setFileName(file.name);
      setFileSize(file.size);
      setModelInfo(parsed);
      setGraph(buildGraph(realGraph));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load ONNX file");
    } finally {
      setLoading(false);
    }
  }, []);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setFileName("");
    setFileSize(0);
    setError("");
    setModelInfo(null);
    setGraph(null);
    setSession(null);
  }

  const hasModel = !!modelInfo;
  type TabId = "overview" | "graph" | "inference";
  const [activeTab, setActiveTab] = useState<TabId>("graph");

  const tabs: { id: TabId; label: string; badge?: string | null }[] = [
    { id: "overview", label: "Overview", badge: fileName || null },
    { id: "graph", label: "Graph", badge: graph ? `${graph.nodes.length} nodes` : null },
    { id: "inference", label: "Inference" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          <span className={`h-2 w-2 rounded-full ${gpuEnabled ? "bg-green-400" : "bg-yellow-400"}`} />
          {gpuEnabled ? "WebGPU" : "WASM"}
        </div>

        {hasModel && (
          <button
            onClick={reset}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
          >
            Load New Model
          </button>
        )}
      </div>

      {/* Upload Section — hidden when model is loaded */}
      {!hasModel && (
        <div
          className={`w-full rounded-3xl border-2 border-dashed p-10 text-center backdrop-blur-xl transition-colors ${
            dragging
              ? "border-cyan-400/60 bg-cyan-400/10"
              : "border-white/10 bg-white/5"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-white/5 p-6">
              <svg
                className="h-10 w-10 text-gray-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white">Upload ONNX Model</h2>
            <p className="text-sm text-gray-400">
              Drag & drop your <span className="font-mono text-cyan-400">.onnx</span> file here, or click to browse
            </p>

            <input
              type="file"
              accept=".onnx"
              onChange={onSelect}
              className="hidden"
              id="onnx-upload"
            />
            <label
              htmlFor="onnx-upload"
              className="cursor-pointer rounded-2xl bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Select File
            </label>

            {loading && (
              <div className="flex items-center gap-3 text-sm text-cyan-300">
                <Spinner /> Loading model...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay when model is loaded but still processing */}
      {loading && hasModel && (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-12 text-cyan-300 backdrop-blur-xl">
          <Spinner /> Processing model...
        </div>
      )}

      {/* Error after model was loaded */}
      {error && hasModel && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Main Workspace */}
      {hasModel && (
        <div className="min-w-0">
          {/* Tab Bar */}
          <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-white/10 bg-[#0B1020]/95 px-6 backdrop-blur-xl">
            <nav className="flex gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-cyan-400 text-white"
                        : "border-transparent text-gray-500 hover:border-gray-600 hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] text-gray-400">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && modelInfo && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-sm text-cyan-300">{fileName}</span>
                <span className="text-xs text-gray-600">{formatSize(fileSize)}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {modelInfo.inputs.length} input{modelInfo.inputs.length !== 1 ? "s" : ""} &middot;{" "}
                  {modelInfo.outputs.length} output{modelInfo.outputs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Inputs / Outputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-400">
                    Inputs ({modelInfo.inputs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {modelInfo.inputs.map((input: ParsedInput) => (
                      <div key={input.name} className="rounded-xl bg-black/30 px-3 py-2.5 text-xs">
                        <div className="mb-0.5 font-mono text-green-300">{input.name}</div>
                        <div className="flex gap-3 text-gray-500">
                          <span>{input.type}</span>
                          <span>[{input.dimensions?.join(", ") || "?"}]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Outputs ({modelInfo.outputs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {modelInfo.outputs.map((output: ParsedInput) => (
                      <div key={output.name} className="rounded-xl bg-black/30 px-3 py-2.5 text-xs">
                        <div className="mb-0.5 font-mono text-blue-300">{output.name}</div>
                        <div className="flex gap-3 text-gray-500">
                          <span>{output.type}</span>
                          <span>[{output.dimensions?.join(", ") || "?"}]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "graph" && graph && (
            <ModelGraph nodes={graph.nodes} edges={graph.edges} />
          )}

          {activeTab === "inference" && session && (
            <InputPanel session={session} />
          )}
        </div>
      )}
    </div>
  );
}
