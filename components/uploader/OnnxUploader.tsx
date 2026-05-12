"use client";

import { useState } from "react";
import { parseOnnxModel } from "@/lib/onnx/parser";
import { buildGraph } from "@/lib/onnx/graph";
import ModelGraph from "@/components/graph/ModelGraph";
import { parseGraph } from "@/lib/onnx/graphParser";

export default function OnnxUploader() {
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);

  async function handleFile(file: File) {
    setError("");

    if (!file.name.endsWith(".onnx")) {
      setError("Please upload a valid ONNX file");
      return;
    }

    try {
      setLoading(true);

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      console.log("ONNX File Loaded");
      console.log("Filename:", file.name);
      console.log("Size:", file.size);
      console.log("ArrayBuffer:", arrayBuffer);

      setFileName(file.name);

      // Parse ONNX model
      const parsed = await parseOnnxModel(arrayBuffer);
      console.log("Parsed Model:", parsed);
      setModelInfo(parsed);

      const realGraph = await parseGraph(arrayBuffer);
      const generatedGraph = buildGraph(realGraph);

      setGraph(generatedGraph);
      // const graphData = await parseGraph(arrayBuffer)
      // console.log(graphData)
    } catch (err) {
      console.error(err);
      setError("Failed to read ONNX file");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file) {
      handleFile(file);
    }
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <div
        className="
      w-full
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-10
      backdrop-blur-xl
    "
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Upload ONNX Model
          </h2>

          <p className="mb-8 text-gray-400">Drag and drop your ONNX file</p>

          <input
            type="file"
            accept=".onnx"
            onChange={onSelect}
            className="hidden"
            id="onnx-upload"
          />

          <label
            htmlFor="onnx-upload"
            className="
            cursor-pointer
            rounded-2xl
            bg-blue-600
            px-8
            py-4
            font-medium
            text-white
            transition
            hover:bg-blue-500
          "
          >
            Select File
          </label>

          {fileName && (
            <p className="mt-4 text-green-400">Loaded: {fileName}</p>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div
        className="
      flex
      w-full
      gap-6
      items-start
    "
      >
        {/* Left Side */}
        <div className="flex-1 space-y-6">
          {/* Model Info */}
          {modelInfo && (
            <div
              className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
            text-white
            backdrop-blur-xl
          "
            >
              <h3 className="mb-6 text-2xl font-bold">Model Information</h3>

              {/* Inputs */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold">Inputs</h4>

                <div className="space-y-3">
                  {modelInfo.inputs.map((input: any) => (
                    <div
                      key={input.name}
                      className="
                      rounded-2xl
                      bg-black/20
                      p-4
                    "
                    >
                      <p>
                        <strong>Name:</strong> {input.name}
                      </p>

                      <p>
                        <strong>Type:</strong> {input.type}
                      </p>

                      <p>
                        <strong>Shape:</strong> [{input.dimensions?.join(", ")}]
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <h4 className="mb-3 text-lg font-semibold">Outputs</h4>

                <div className="space-y-3">
                  {modelInfo.outputs.map((output: any) => (
                    <div
                      key={output.name}
                      className="
                      rounded-2xl
                      bg-black/20
                      p-4
                    "
                    >
                      <p>
                        <strong>Name:</strong> {output.name}
                      </p>

                      <p>
                        <strong>Type:</strong> {output.type}
                      </p>

                      <p>
                        <strong>Shape:</strong> [{output.dimensions?.join(", ")}
                        ]
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Graph */}
          {graph && <ModelGraph nodes={graph.nodes} edges={graph.edges} />}
        </div>
      </div>
    </div>
  );
}
