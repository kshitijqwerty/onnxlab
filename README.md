# ONNXLab

A browser-native ONNX model visualization and inference platform built with Next.js, React Flow, and ONNX Runtime Web.

---

## Features

### Interactive Graph Visualization

- Upload `.onnx` models directly in the browser
- Interactive, movable node graph with top-to-bottom layout
- Netron-inspired node inspector
- Tensor shape and type annotations on nodes
- Node attribute inspection
- Input/output tensor connections

### Runtime Model Parsing

ONNXLab parses models dynamically at runtime, extracting model inputs/outputs, tensor shapes and types, node attributes, and full graph structure.

### Dynamic Input System

Input UI is automatically generated from model metadata. Supports image tensors, vector tensors, and generic tensors — with automatic detection of dimensions, data types, and shape structure.

### Image Inference Pipeline

- Upload an image directly in the browser
- Automatic image → tensor conversion with dynamic resizing based on model input shape
- Fully client-side inference — no backend required

### Tensor Analysis

Automatically analyzes output tensors and displays type, shape, total values, min/max, and mean. Supports generic ONNX outputs.

### Prediction Viewer

Top-K prediction extraction with human-readable labels and raw tensor visualization. Upload an optional `labels.json` to map tensor indices to class names:

```json
["cat", "dog", "car", "person"]
```

Works with ImageNet, CIFAR, and any custom classification dataset.

---

## Tech Stack

| Layer | Libraries |
|---|---|
| Frontend | Next.js, React, TypeScript, TailwindCSS |
| Graph | React Flow, Dagre |
| ML Runtime | ONNX Runtime Web, WebAssembly, WebGPU |

---

## Getting Started

```bash
git clone https://github.com/yourusername/onnxlab.git
cd onnxlab
npm install
npm run dev
```

---

## Usage

1. **Upload** any `.onnx` model file
2. **Explore** the graph — inspect nodes, view tensor metadata, analyze shapes
3. **Run inference** — upload an input image, optionally upload a `labels.json`, and run inference directly in the browser

---

## WebGPU / WASM Execution

ONNXLab uses both WebGPU and WebAssembly execution providers:

```ts
executionProviders: ['webgpu', 'wasm']
```

It automatically uses GPU acceleration when available and falls back to WASM on unsupported devices.

---

## Supported Models

ResNet, MobileNet, YOLO, ViT, BERT, segmentation models, classification models, and any custom ONNX model.

---

## Project Structure

```
src/
├── app/
├── components/
│   ├── graph/
│   ├── inference/
│   ├── inspector/
│   └── uploader/
└── lib/
    └── onnx/
        ├── analyzeTensor.ts
        ├── checkWebGpu.ts
        ├── imageTensor.ts
        ├── inputType.ts
        ├── parseOutputs.ts
        ├── parser.ts
        ├── runInference.ts
        ├── softmax.ts
        └── topK.ts
```

---

## Roadmap

- Tensor heatmaps and embedding visualization
- YOLO bounding boxes and segmentation overlays
- Audio model support
- Performance benchmarking and tensor profiling
- Multi-model comparison
- Saved sessions and drag-and-drop workflow
- Cloud model hosting

---

## License

MIT