# Debian (glibc) base: the native ONNX runtime used for embeddings doesn't run on Alpine (musl).
FROM node:20-bookworm-slim AS builder
WORKDIR /app
# Skip the optional CUDA binaries (several hundred MB); CPU inference is bundled.
ENV ONNXRUNTIME_NODE_INSTALL=skip \
    NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Pre-download the embedding model so the container works offline from the first request.
RUN node -e "import('@huggingface/transformers').then(async ({ pipeline, env }) => { env.cacheDir = '/app/.cache/models'; await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', { dtype: 'q8' }); console.log('embedding model cached'); })"

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    EMBEDDING_CACHE_DIR=/app/.cache/models
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.cache/models ./.cache/models
USER node
EXPOSE 3000
CMD ["node", "server.js"]
