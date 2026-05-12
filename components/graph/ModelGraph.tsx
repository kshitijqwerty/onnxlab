"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import { useState } from "react";
import NodeInspector from "./NodeInspector";
import OperatorNode from "./OperatorNode";
import "reactflow/dist/style.css";

interface Props {
  nodes: Node[];
  edges: Edge[];
}
const nodeTypes = {
  operator: OperatorNode,
};
export default function ModelGraph({
  nodes: initialNodes,
  edges: initialEdges,
}: Props) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  return (
    <div
      className="
    overflow-hidden
    rounded-3xl
    border
    border-white/10
    bg-[#111827]
    shadow-2xl
  "
    >
      {/* Header */}
      <div
        className="
      border-b
      border-white/10
      bg-black/20
      px-6
      py-4
    "
      >
        <h2 className="text-xl font-bold text-white">Computational Graph</h2>

        <p className="text-sm text-gray-400">
          Interactive neural network visualization
        </p>
      </div>

      <div className="flex h-[800px]">
        {/* Graph */}
        <div className="flex-1 bg-[#0B1020]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            fitViewOptions={{
              padding: 0.2,
            }}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              style: {
                strokeWidth: 2,
                stroke: "#94A3B8",
              },
            }}
            onNodeClick={(_, node) => {
              setSelectedNode(node);
            }}
          >
            <Background gap={24} size={1} color="#1E293B" />

            <Controls />

            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <NodeInspector node={selectedNode} />
      </div>
    </div>
  );
}
