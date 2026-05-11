import * as ort from 'onnxruntime-web'

export interface ParsedInput {
  name: string
  type: string
  dimensions: readonly (string | number | null)[]
}

export interface ParsedModel {
  inputs: ParsedInput[]
  outputs: ParsedInput[]
}

// Function to detect onnx model type
function detectModelType(shape: number[]) {

  if (
    shape.length === 4 &&
    shape[1] === 3
  ) {
    return 'image'
  }

  return 'unknown'
}

export async function parseOnnxModel(
  arrayBuffer: ArrayBuffer
): Promise<ParsedModel> {

  const session = await ort.InferenceSession.create(arrayBuffer, {
    executionProviders: ['wasm']
  })

  console.log(session.inputMetadata)
  console.log(session.outputMetadata)

  // Inputs
  const inputs: ParsedInput[] = session.inputMetadata.map((meta: any) => ({
    name: meta.name,
    type: meta.type || 'unknown',
    dimensions: meta.shape || []
  }))

  // Outputs
  const outputs: ParsedInput[] = session.outputMetadata.map((meta: any) => ({
    name: meta.name,
    type: meta.type || 'unknown',
    dimensions: meta.shape || []
  }))

  return {
    inputs,
    outputs
  }
}