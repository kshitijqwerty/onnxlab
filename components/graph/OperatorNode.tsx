"use client";

import { Handle, Position } from "reactflow";

interface Props {
  data: {
    label: string;
    inputs?: string[];
    outputs?: string[];
    attributes?: any[];
  };
}

function getNodeColor(opType: string) {
  switch (opType.toLowerCase()) {
    case "conv":
      return "from-blue-500 to-blue-700";

    case "relu":
      return "from-green-500 to-green-700";

    case "matmul":
      return "from-purple-500 to-purple-700";

    case "attention":
      return "from-orange-500 to-orange-700";

    case "softmax":
      return "from-pink-500 to-pink-700";

    case "add":
      return "from-yellow-500 to-yellow-700";

    default:
      return "from-gray-700 to-gray-900";
  }
}

export default function OperatorNode({ data }: Props) {
  return (
    <div
      className={`
        min-w-[240px]
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-br
        text-white
        shadow-2xl
        transition-all
        hover:scale-[1.02]
        hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]
        ${getNodeColor(data.label)}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-400" />

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-bold">{data.label}</div>

          <div className="rounded-full bg-white/20 px-2 py-1 text-xs">OP</div>
        </div>

        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
            <span>Inputs</span>

            <span>{data.inputs?.length || 0}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
            <span>Outputs</span>

            <span>{data.outputs?.length || 0}</span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-pink-400"
      />
    </div>
  );
}
