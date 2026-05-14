export function detectInputType(shape: any[], type: string) {
  if (!shape) {
    return "unknown";
  }

  // Image tensor
  if (shape.length === 4 && (shape[1] === 3 || shape[1] === 1)) {
    return "image";
  }

  // Sequence / text
  if (shape.length === 2) {
    return "sequence";
  }

  // Vector
  if (shape.length === 1) {
    return "vector";
  }

  return "tensor";
}
