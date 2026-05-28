/* eslint-disable @typescript-eslint/no-explicit-any */
import * as protobuf from "protobufjs";
import type { TensorInfo, ParsedGraph, Attribute } from "./types";

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "low" in v) {
    return (v as { low: number }).low;
  }
  return Number(v);
}

function extractTensorShape(tensorType: any): (number | string)[] | null {
  if (!tensorType) {
    return null;
  }

  const dims = tensorType.shape?.dim || [];

  if (!dims.length) {
    return null;
  }

  return dims.map((d: any) => {
    if (d.dimValue !== undefined && d.dimValue !== null) {
      return toNumber(d.dimValue);
    }

    if (d.dimParam) {
      return d.dimParam;
    }

    return "?";
  });
}

function extractInitializerShape(initializer: any): (number | string)[] | null {
  const dims = initializer.dims;
  if (!dims || !dims.length) return null;
  return Array.from(dims).map(toNumber);
}

function buildTensorMap(
  valueInfos: any[],
  initializers: any[]
): Map<string, TensorInfo> {
  const map = new Map<string, TensorInfo>();

  for (const tensor of valueInfos) {
    const tensorType = tensor.type?.tensorType;
    map.set(tensor.name, {
      name: tensor.name,
      elemType: tensorType?.elemType,
      shape: extractTensorShape(tensorType),
    });
  }

  for (const init of initializers) {
    if (!map.has(init.name)) {
      map.set(init.name, {
        name: init.name,
        elemType: init.dataType,
        shape: extractInitializerShape(init),
      });
    }
  }

  return map;
}

export async function parseGraph(
  arrayBuffer: ArrayBuffer
): Promise<ParsedGraph> {
  const root = await protobuf.load("/onnx.proto3");

  const ModelProto = root.lookupType("onnx.ModelProto");

  const decoded = ModelProto.decode(new Uint8Array(arrayBuffer)) as any;

  const graph = decoded.graph;

  const allTensors = [
    ...(graph.input || []),
    ...(graph.output || []),
    ...(graph.valueInfo || []),
  ];

  const tensorMap = buildTensorMap(allTensors, graph.initializer || []);

  const missingNames = new Set<string>();
  for (const node of graph.node || []) {
    for (const name of node.input || []) {
      if (name && !tensorMap.has(name)) missingNames.add(name);
    }
    for (const name of node.output || []) {
      if (name && !tensorMap.has(name)) missingNames.add(name);
    }
  }

  for (const name of missingNames) {
    tensorMap.set(name, { name, elemType: undefined, shape: null });
  }

  return {
    name: graph.name,
    tensorMap,
    nodes: (graph.node || []).map((node: any) => ({
      name: node.name,
      opType: node.opType,
      domain: node.domain,
      inputs: (node.input || []).map((name: string) => ({
        name,
        tensor: tensorMap.get(name),
      })),
      outputs: (node.output || []).map((name: string) => ({
        name,
        tensor: tensorMap.get(name),
      })),
      attributes: (node.attribute || []) as Attribute[],
    })),
  };
}
