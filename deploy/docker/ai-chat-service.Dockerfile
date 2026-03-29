FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/ai-chat-service/package*.json /workspace/backend/services/ai-chat-service/
RUN cd /workspace/backend/services/ai-chat-service && npm install

COPY backend/services/ai-chat-service /workspace/backend/services/ai-chat-service
RUN cd /workspace/backend/services/ai-chat-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/ai-chat-service/package*.json /app/
COPY --from=builder /workspace/backend/services/ai-chat-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/ai-chat-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3007
CMD ["node", "dist/index.js"]
