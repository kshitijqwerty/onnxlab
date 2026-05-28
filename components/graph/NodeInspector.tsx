"use client";

import type { Node } from "reactflow";
import type { Attribute, NodeIO } from "@/lib/onnx/types";
import type { OperatorNodeData } from "@/lib/onnx/graph";

interface Props {
  node: Node<OperatorNodeData> | null;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "low" in v) return (v as { low: number }).low;
  return Number(v);
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "low" in value) return toNumber(value);
  return value;
}

function formatAttributeValue(attr: Attribute): string {
  if (attr.floats?.length) return `[${attr.floats.map(normalizeValue).join(", ")}]`;
  if (attr.ints?.length) return `[${attr.ints.map(normalizeValue).join(", ")}]`;
  if (attr.strings?.length) return attr.strings.join(", ");
  if (attr.i !== undefined) return String(normalizeValue(attr.i));
  if (attr.f !== undefined) return String(attr.f);
  if (attr.s) return attr.s;
  return "N/A";
}

const LEGEND_ITEMS: { op: string; color: string }[] = [
  { op: "Conv", color: "bg-blue-500" },
  { op: "Relu", color: "bg-green-500" },
  { op: "MatMul", color: "bg-purple-500" },
  { op: "Softmax", color: "bg-pink-500" },
  { op: "Reshape", color: "bg-teal-500" },
  { op: "Add / Mul", color: "bg-yellow-500" },
  { op: "Pool", color: "bg-rose-500" },
  { op: "Normalize", color: "bg-cyan-500" },
  { op: "Other", color: "bg-gray-700" },
];

export default function NodeInspector({ node }: Props) {
  if (!node) {
    return (
      <div className="w-[340px] border-l border-white/10 bg-[#111827] p-5 text-sm text-gray-500">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Click a node to inspect
        </div>
        <div className="mb-3 text-xs text-gray-500">Op type color legend:</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.op} className="flex items-center gap-2 text-xs">
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
              <span className="text-gray-400">{item.op}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const data = node.data;

  return (
    <div className="w-[340px] overflow-y-auto border-l border-white/10 bg-[#111827] p-5 text-white">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 text-xs uppercase tracking-wider text-gray-400">Operator</div>
        <h2 className="text-2xl font-bold">{data.opType}</h2>
        <div className="mt-1 font-mono text-xs text-gray-500">{data.domain || "ai.onnx"}</div>
      </div>

      {/* Metadata */}
      <div className="mb-5 rounded-xl bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-300">Metadata</h3>
        <div className="space-y-2 text-xs">
          {[
            { label: "Inputs", value: data.inputs?.length || 0 },
            { label: "Outputs", value: data.outputs?.length || 0 },
            { label: "Attributes", value: data.attributes?.length || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-500">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-5 rounded-xl bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-green-400">Inputs</h3>
        <div className="space-y-1.5">
          {data.inputs?.map((input: NodeIO, index: number) => (
            <div key={index} className="overflow-hidden rounded-lg bg-black p-2.5">
              <div className="mb-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-green-300">
                {input.name}
              </div>
              <div className="font-mono text-[10px] text-cyan-300">
                Shape: {input.tensor?.shape ? `[${input.tensor.shape.join(", ")}]` : "?"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div className="mb-5 rounded-xl bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-blue-400">Outputs</h3>
        <div className="space-y-1.5">
          {data.outputs?.map((output: NodeIO, index: number) => (
            <div key={index} className="overflow-hidden rounded-lg bg-black p-2.5">
              <div className="mb-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-blue-300">
                {output.name}
              </div>
              <div className="font-mono text-[10px] text-cyan-300">
                Shape: {output.tensor?.shape ? `[${output.tensor.shape.join(", ")}]` : "?"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="rounded-xl bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-yellow-400">Attributes</h3>
        {data.attributes?.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-white/5">
            {data.attributes.map((attr: Attribute, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 border-b border-white/5 bg-black/20 px-3 py-2 last:border-b-0"
              >
                <div className="min-w-[100px] font-mono text-xs text-cyan-400">{attr.name}</div>
                <div className="flex-1 overflow-x-auto text-right font-mono text-xs text-gray-300">
                  {formatAttributeValue(attr)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">None</div>
        )}
      </div>
    </div>
  );
}
