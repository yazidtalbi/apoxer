export default function SystemRequirementsSection() {
  // Placeholder data - replace with actual game requirements later
  const minSpecs = {
    os: "Windows 10 64-bit",
    processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
    memory: "8 GB RAM",
    graphics: "NVIDIA GTX 1060 6GB / AMD RX 580",
    directx: "Version 11",
    storage: "50 GB available space",
  };

  const recommendedSpecs = {
    os: "Windows 11 64-bit",
    processor: "Intel Core i7-9700K / AMD Ryzen 7 3700X",
    memory: "16 GB RAM",
    graphics: "NVIDIA RTX 3070 / AMD RX 6700 XT",
    directx: "Version 12",
    storage: "50 GB available space (SSD recommended)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Minimum Requirements */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Minimum Requirements</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-white/60 text-sm mb-1">OS</dt>
            <dd className="text-white text-sm">{minSpecs.os}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Processor</dt>
            <dd className="text-white text-sm">{minSpecs.processor}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Memory</dt>
            <dd className="text-white text-sm">{minSpecs.memory}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Graphics</dt>
            <dd className="text-white text-sm">{minSpecs.graphics}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">DirectX</dt>
            <dd className="text-white text-sm">{minSpecs.directx}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Storage</dt>
            <dd className="text-white text-sm">{minSpecs.storage}</dd>
          </div>
        </dl>
      </div>

      {/* Recommended Requirements */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Recommended Requirements</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-white/60 text-sm mb-1">OS</dt>
            <dd className="text-white text-sm">{recommendedSpecs.os}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Processor</dt>
            <dd className="text-white text-sm">{recommendedSpecs.processor}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Memory</dt>
            <dd className="text-white text-sm">{recommendedSpecs.memory}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Graphics</dt>
            <dd className="text-white text-sm">{recommendedSpecs.graphics}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">DirectX</dt>
            <dd className="text-white text-sm">{recommendedSpecs.directx}</dd>
          </div>
          <div>
            <dt className="text-white/60 text-sm mb-1">Storage</dt>
            <dd className="text-white text-sm">{recommendedSpecs.storage}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

