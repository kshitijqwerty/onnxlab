import OnnxUploader from "@/components/uploader/OnnxUploader";

export default function HomePage() {
  return (
    <main
      className="
      min-h-screen
      bg-[#0B1020]
      text-white
    "
    >
      {/* Top Navbar */}
      <header
        className="
        border-b
        border-white/10
        bg-black/20
        backdrop-blur-xl
      "
      >
        <div
          className="
          flex
          items-center
          justify-between
          px-6
          py-4
"
        >
          <div>
            <h1 className="text-2xl font-bold">ONNX Explorer</h1>

            <p className="text-sm text-gray-400">
              Interactive neural network visualization tool
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <OnnxUploader />
      </div>
    </main>
  );
}
