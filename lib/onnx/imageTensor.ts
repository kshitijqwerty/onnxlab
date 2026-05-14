import * as ort from "onnxruntime-web";

export async function imageToTensor(file: File, width = 224, height = 224) {
  // Load image
  const image = await createImageBitmap(file);

  // Create canvas
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context failed");
  }

  // Draw resized image
  ctx.drawImage(image, 0, 0, width, height);

  // Get pixels
  const imageData = ctx.getImageData(0, 0, width, height);

  const { data } = imageData;

  // Create Float32 tensor
  const floatData = new Float32Array(1 * 3 * width * height);

  // RGB channels
  for (let i = 0; i < width * height; i++) {
    floatData[i] = data[i * 4] / 255.0;

    floatData[width * height + i] = data[i * 4 + 1] / 255.0;

    floatData[2 * width * height + i] = data[i * 4 + 2] / 255.0;
  }

  return new ort.Tensor("float32", floatData, [1, 3, height, width]);
}
