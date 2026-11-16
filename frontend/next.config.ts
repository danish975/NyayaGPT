import type { NextConfig } from "next";

// onnxruntime-node is loaded dynamically by @huggingface/transformers, so Next's
// file tracing misses it. Include its JS plus only this platform's native binary
// (the package ships binaries for every OS, which would bloat the image).
const ORT = "./node_modules/onnxruntime-node";
const onnxRuntimeFiles = [
  `${ORT}/package.json`,
  `${ORT}/dist/**/*`,
  `${ORT}/bin/napi-v6/${process.platform}/${process.arch}/**/*`,
];

const nextConfig: NextConfig = {
  // Emits .next/standalone, which the Dockerfile copies into the runtime image.
  output: "standalone",
  // Native/ONNX packages used for local embeddings must not be bundled.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "sharp"],
  outputFileTracingIncludes: {
    "/api/chat": onnxRuntimeFiles,
    "/api/retrieval-status": onnxRuntimeFiles,
  },
};

export default nextConfig;
