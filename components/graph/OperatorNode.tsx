"use client";

import { Handle, Position } from "reactflow";
import type { OperatorNodeData } from "@/lib/onnx/graph";
import type { NodeIO } from "@/lib/onnx/types";

interface Props {
  data: OperatorNodeData;
}

function getNodeColor(opType: string) {
  switch (opType.toLowerCase()) {
    case "conv":
      return "bg-blue-500";

    case "relu":
      return "bg-green-500";

    case "matmul":
      return "bg-purple-500";

    case "attention":
      return "bg-orange-500";

    case "softmax":
      return "bg-pink-500";

    default:
      return "bg-gray-700";
  }
}

export default function OperatorNode({ data }: Props) {
  return (
    <div
      className="
      min-w-[140px]
      rounded-xl
      border
      border-white/10
      bg-[#111827]
      shadow-xl
      transition
      hover:scale-[1.02]
    "
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !bg-cyan-400"
      />

      {/* Header */}
      <div
        className="
        flex
        items-center
        gap-2
        p-3
      "
      >
        {/* Color Dot */}
        <div
          className={`
            h-3
            w-3
            rounded-full
            ${getNodeColor(data.opType)}
          `}
        />

        {/* Operator */}
        <div>
          <div
            className="
            text-sm
            font-semibold
            text-white
          "
          >
            {data.opType}
          </div>

          <div
            className="
            text-[10px]
            text-gray-400
          "
          >
            {/* {data.domain || "ai.onnx"} */}
          </div>
        </div>
      </div>
      <div
        className="
  mt-2
  space-y-1
"
      >
        {data.outputs?.slice(0, 2).map((output: NodeIO, index: number) => (
          <div
            key={index}
            className="
          rounded
          bg-black/30
          px-2
          py-1
          font-mono
          text-[10px]
          text-cyan-300
        "
          >
            {output.tensor?.shape
              ? `[${output.tensor.shape.join(", ")}]`
              : "?"}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="
        border-t
        border-white/5
        px-3
        py-2
      "
      >
        <div
          className="
          flex
          items-center
          justify-between
          text-[10px]
          text-gray-400
        "
        >
          <span>IN {data.inputs?.length || 0}</span>

          <span>OUT {data.outputs?.length || 0}</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-pink-400"
      />
    </div>
  );
}
