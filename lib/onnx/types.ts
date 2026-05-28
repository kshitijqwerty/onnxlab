export interface TensorInfo {
  name: string;
  elemType?: number;
  shape: (number | string)[] | null;
}

export interface NodeIO {
  name: string;
  tensor?: TensorInfo;
}

export interface Attribute {
  name: string;
  type?: number;
  f?: number;
  i?: number;
  s?: string;
  floats?: number[];
  ints?: number[];
  strings?: string[];
}

export interface GraphNode {
  name: string;
  opType: string;
  domain: string;
  inputs: NodeIO[];
  outputs: NodeIO[];
  attributes: Attribute[];
}

export interface ParsedGraph {
  name: string;
  tensorMap: Map<string, TensorInfo>;
  nodes: GraphNode[];
}

export type NumericArray = Float32Array | Int32Array | Uint8Array | Uint16Array | Int16Array | Float64Array;

export interface OutputTensor {
  name: string;
  type: string;
  dims: readonly number[];
  data: NumericArray;
}

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
  className?: string;
}

export interface TensorAnalysis {
  total: number;
  min: number;
  max: number;
  mean: number;
  isClassification: boolean;
  isEmbedding: boolean;
  isDetection: boolean;
}
