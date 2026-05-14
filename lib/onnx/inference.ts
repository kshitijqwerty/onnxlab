import * as ort from "onnxruntime-web";

export async function createSession(arrayBuffer: ArrayBuffer) {
  const session = await ort.InferenceSession.create(arrayBuffer, {
    executionProviders: ["wasm"],
  });

  return session;
}
