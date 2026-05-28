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

export async function parseOnnxModel(
  arrayBuffer: ArrayBuffer
): Promise<ParsedModel> {

  const session = await ort.InferenceSession.create(arrayBuffer, {
    executionProviders: ['webgpu', 'wasm']
  })

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