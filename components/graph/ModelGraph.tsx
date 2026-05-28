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
import { useState, useEffect } from "react";
import NodeInspector from "./NodeInspector";
import OperatorNode from "./OperatorNode";
import type { OperatorNodeData } from "@/lib/onnx/graph";
import "reactflow/dist/style.css";

interface Props {
  nodes: Node<OperatorNodeData>[];
  edges: Edge[];
}
const nodeTypes = {
  operator: OperatorNode,
};

function PanelToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 z-10 hidden rounded-xl border border-white/10 bg-[#111827] px-3 py-1.5 text-xs text-gray-400 transition hover:text-white max-md:block"
    >
      {open ? "Close Inspector" : "Inspector"}
    </button>
  );
}

export default function ModelGraph({
  nodes: initialNodes,
  edges: initialEdges,
}: Props) {
  const [selectedNode, setSelectedNode] = useState<Node<OperatorNodeData> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
      <div className="flex h-[800px]">
        {/* Graph */}
        <div className="relative flex-1 bg-[#0B1020]">
          <PanelToggle
            open={inspectorOpen}
            onClick={() => setInspectorOpen((v) => !v)}
          />
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
              setInspectorOpen(true);
            }}
          >
            <Background gap={24} size={1} color="#1E293B" />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <div
          className={`w-[340px] shrink-0 overflow-y-auto border-l border-white/10 transition-all max-md:fixed max-md:bottom-0 max-md:left-0 max-md:z-20 max-md:w-full max-md:rounded-t-2xl max-md:border-l-0 max-md:border-t ${
            inspectorOpen ? "max-md:max-h-[60vh]" : "max-md:max-h-0 max-md:overflow-hidden max-md:border-t-0"
          }`}
        >
          <NodeInspector node={selectedNode} />
        </div>
      </div>
    </div>
  );
}
