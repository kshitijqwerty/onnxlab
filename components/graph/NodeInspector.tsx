'use client'

interface Props {
  node: any
}

export default function NodeInspector({
  node
}: Props) {

  if (!node) {
    return (
      <div className="w-[350px] border-l bg-white p-6">
        <p className="text-gray-500">
          Select a node
        </p>
      </div>
    )
  }

  const data = node.data

  return (
    <div className="w-[350px] overflow-y-auto border-l bg-white p-6">

      <h2 className="mb-6 text-2xl font-bold">
        {data.label}
      </h2>

      {/* Inputs */}
      <div className="mb-6">

        <h3 className="mb-2 text-lg font-semibold">
          Inputs
        </h3>

        <div className="space-y-2">

          {data.inputs?.map(
            (input: string, index: number) => (
              <div
                key={index}
                className="rounded-lg bg-gray-100 p-2 text-sm"
              >
                {input}
              </div>
            )
          )}

        </div>
      </div>

      {/* Outputs */}
      <div className="mb-6">

        <h3 className="mb-2 text-lg font-semibold">
          Outputs
        </h3>

        <div className="space-y-2">

          {data.outputs?.map(
            (output: string, index: number) => (
              <div
                key={index}
                className="rounded-lg bg-gray-100 p-2 text-sm"
              >
                {output}
              </div>
            )
          )}

        </div>
      </div>

      {/* Attributes */}
      <div>

        <h3 className="mb-2 text-lg font-semibold">
          Attributes
        </h3>

        <div className="space-y-2">

          {data.attributes?.length > 0 ? (
            data.attributes.map(
              (attr: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-100 p-2 text-sm"
                >
                  <div className="font-medium">
                    {attr.name}
                  </div>

                  <div className="text-gray-600">
                    {JSON.stringify(attr)}
                  </div>
                </div>
              )
            )
          ) : (
            <p className="text-sm text-gray-500">
              No attributes
            </p>
          )}

        </div>
      </div>

    </div>
  )
}