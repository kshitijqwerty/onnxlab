'use client'

import { Handle, Position } from 'reactflow'

interface Props {
  data: {
    label: string
    inputs?: number
    outputs?: number
  }
}

function getNodeColor(opType: string) {

  switch (opType.toLowerCase()) {

    case 'conv':
      return 'bg-blue-500'

    case 'relu':
      return 'bg-green-500'

    case 'matmul':
      return 'bg-purple-500'

    case 'add':
      return 'bg-yellow-500'

    case 'attention':
      return 'bg-orange-500'

    case 'softmax':
      return 'bg-pink-500'

    default:
      return 'bg-gray-700'
  }
}

export default function OperatorNode({
  data
}: Props) {

  return (
    <div
      className={`
        min-w-[180px]
        rounded-xl
        border
        border-gray-300
        text-white
        shadow-lg
        ${getNodeColor(data.label)}
      `}
    >

      <Handle
        type="target"
        position={Position.Left}
      />

      <div className="p-4">

        <div className="text-lg font-bold">
          {data.label}
        </div>

        <div className="mt-2 text-sm opacity-90">

          <div>
            Inputs: {data.inputs || 0}
          </div>

          <div>
            Outputs: {data.outputs || 0}
          </div>

        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
      />

    </div>
  )
}