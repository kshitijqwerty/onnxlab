'use client'

import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge
} from 'reactflow'
import { useState } from 'react'
import NodeInspector from './NodeInspector'
import OperatorNode from './OperatorNode'
import 'reactflow/dist/style.css'

interface Props {
    nodes: Node[]
    edges: Edge[]
}
const nodeTypes = {
  operator: OperatorNode
}
export default function ModelGraph({
    nodes,
    edges
}: Props) {
    const [selectedNode, setSelectedNode] = useState<any>(null)
    return (
        <div className="flex h-[700px] w-full overflow-hidden rounded-2xl border bg-white">

            <div className="flex-1">

                <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onNodeClick={(_, node) => {
                    setSelectedNode(node)
                }}
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>

            </div>

            <NodeInspector node={selectedNode} />

        </div>
    )
}