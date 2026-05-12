"use client";

interface Props {
  node: any;
}

export default function NodeInspector({ node }: Props) {
  if (!node) {
    return (
      <div
        className="
        flex
        w-[380px]
        items-center
        justify-center
        border-l
        border-white/10
        bg-[#111827]
        text-gray-500
      "
      >
        Select an operator node
      </div>
    );
  }

  const data = node.data;

  return (
    <div
      className="
      w-[380px]
      overflow-y-auto
      border-l
      border-white/10
      bg-[#111827]
      p-6
      text-white
    "
    >
      {/* Header */}
      <div
        className="
        mb-6
        rounded-2xl
        border
        border-white/10
        bg-black/30
        p-5
      "
      >
        <div className="mb-2 text-sm text-gray-400">Operator</div>

        <h2 className="text-3xl font-bold">{data.label}</h2>
      </div>

      {/* Inputs */}
      <div
        className="
        mb-6
        rounded-2xl
        border
        border-white/10
        bg-black/20
        p-5
      "
      >
        <h3 className="mb-4 text-lg font-semibold">Inputs</h3>

        <div className="space-y-2">
          {data.inputs?.map((input: string, index: number) => (
            <div
              key={index}
              className="
                  rounded-lg
                  bg-black
                  p-3
                  font-mono
                  text-sm
                  text-green-400
                "
            >
              {input}
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div
        className="
        mb-6
        rounded-2xl
        border
        border-white/10
        bg-black/20
        p-5
      "
      >
        <h3 className="mb-4 text-lg font-semibold">Outputs</h3>

        <div className="space-y-2">
          {data.outputs?.map((output: string, index: number) => (
            <div
              key={index}
              className="
                  rounded-lg
                  bg-black
                  p-3
                  font-mono
                  text-sm
                  text-blue-400
                "
            >
              {output}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
