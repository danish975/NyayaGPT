import type { NextConfig } from "next";

/*
 * Local embeddings (hybrid retrieval) use onnxruntime-node, which ships native
 * binaries for every OS/CPU (~290 MB in total). @huggingface/transformers loads
 * it dynamically, so Next's file tracer can't tell which binary is needed and
 * copies them all — pushing serverless functions past Vercel's 250 MB limit.
 *
 * Keep only the binary for the platform doing the build (linux/x64 on Vercel,
 * ~44 MB) and drop packages that are never loaded in Node.
 */
const ORT = "node_modules/onnxruntime-node";
const PLATFORMS = ["darwin/arm64", "darwin/x64", "linux/arm64", "linux/x64", "win32/arm64", "win32/x64"];
const current = `${process.platform}/${process.arch}`;

const onnxRuntimeIncludes = [
  `./${ORT}/package.json`,
  `./${ORT}/dist/**/*`,
  `./${ORT}/bin/napi-v6/${current}/**/*`,
];

const heavyUnusedFiles = [
  // Native binaries for other platforms.
  ...PLATFORMS.filter((p) => p !== current).map((p) => `${ORT}/bin/napi-v6/${p}/**/*`),
  // Optional GPU provider libraries (CPU inference only).
  `${ORT}/bin/**/*providers_cuda*`,
  `${ORT}/bin/**/*providers_tensorrt*`,
  // The WebAssembly runtime is already bundled inside transformers.js; this package isn't loaded in Node.
  "node_modules/onnxruntime-web/**/*",
  // Browser builds of transformers.js (the server uses transformers.node.*).
  "node_modules/@huggingface/transformers/dist/transformers.web*.js",
  "node_modules/@huggingface/transformers/dist/transformers.js",
  "node_modules/@huggingface/transformers/dist/transformers.min.js",
  // Downloaded models are fetched at runtime (or baked into the Docker image), never traced.
  ".cache/**/*",
];

const nextConfig: NextConfig = {
  // Emits .next/standalone, which the Dockerfile copies into the runtime image.
  output: "standalone",
  // Native/ONNX packages used for local embeddings must not be bundled.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "sharp"],
  outputFileTracingIncludes: {
    "/api/chat": onnxRuntimeIncludes,
    "/api/retrieval-status": onnxRuntimeIncludes,
  },
  outputFileTracingExcludes: {
    "*": heavyUnusedFiles,
  },
};

export default nextConfig;
