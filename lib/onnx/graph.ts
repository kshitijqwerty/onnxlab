import { Edge, Node } from 'reactflow'
import dagre from 'dagre'

const dagreGraph = new dagre.graphlib.Graph()

dagreGraph.setDefaultEdgeLabel(() => ({}))

const NODE_WIDTH = 180
const NODE_HEIGHT = 60

function layoutGraph(
  nodes: Node[],
  edges: Edge[]
) {

  dagreGraph.setGraph({
    rankdir: 'TB'
  })

  // Register nodes
  nodes.forEach((node) => {

    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    })
  })

  // Register edges
  edges.forEach((edge) => {

    dagreGraph.setEdge(
      edge.source,
      edge.target
    )
  })

  // Compute layout
  dagre.layout(dagreGraph)

  // Apply positions
  nodes.forEach((node) => {

    const position =
      dagreGraph.node(node.id)

    node.position = {
      x: position.x - NODE_WIDTH / 2,
      y: position.y - NODE_HEIGHT / 2
    }
  })

  return nodes
}

export function buildGraph(graph: any) {

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Tensor → Producer map
  const tensorProducerMap = new Map<string, string>()

  // First pass:
  // Create nodes
  graph.node.forEach((node: any, index: number) => {

    const nodeId = `node-${index}`

    nodes.push({
      id: nodeId,
      position: {
        x: 0,
        y: 0
      },
      data: {
        label: node.opType,
        inputs: node.input || [],
        outputs: node.output || [],
        attributes: node.attribute || [],
        originalNode: node
      },
      type: 'operator'
    })

    // Register outputs
    node.output?.forEach((output: string) => {
      tensorProducerMap.set(output, nodeId)
    })
  })

  // Second pass:
  // Create edges from tensor dependencies
  graph.node.forEach((node: any, index: number) => {

    const currentNodeId = `node-${index}`

    node.input?.forEach((inputTensor: string) => {

      const sourceNodeId =
        tensorProducerMap.get(inputTensor)

      if (
        sourceNodeId &&
        sourceNodeId !== currentNodeId
      ) {

        edges.push({
          id: `${sourceNodeId}-${currentNodeId}-${inputTensor}`,
          source: sourceNodeId,
          target: currentNodeId,
          label: inputTensor
        })
      }
    })
  })

    const layoutedNodes =
    layoutGraph(nodes, edges)

    return {
    nodes: layoutedNodes,
    edges
    }
}