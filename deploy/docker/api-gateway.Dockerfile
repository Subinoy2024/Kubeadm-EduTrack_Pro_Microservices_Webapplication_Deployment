FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/api-gateway/package*.json /workspace/backend/api-gateway/
RUN cd /workspace/backend/api-gateway && npm install

COPY backend/api-gateway /workspace/backend/api-gateway
RUN cd /workspace/backend/api-gateway && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/api-gateway/package*.json /app/
COPY --from=builder /workspace/backend/api-gateway/node_modules /app/node_modules
COPY --from=builder /workspace/backend/api-gateway/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3000
CMD ["node", "dist/index.js"]
