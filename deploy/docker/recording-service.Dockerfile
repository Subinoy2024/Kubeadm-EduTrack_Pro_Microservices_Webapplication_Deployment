FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/shared /workspace/backend/shared
COPY backend/services/recording-service /workspace/backend/services/recording-service

RUN cd /workspace/backend/shared && npm install && npm run build
RUN cd /workspace/backend/services/recording-service && npm install && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/recording-service/package*.json /app/
COPY --from=builder /workspace/backend/services/recording-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/recording-service/dist /app/dist

RUN mkdir -p /app/node_modules/@edutrack
COPY --from=builder /workspace/backend/shared /app/node_modules/@edutrack/shared

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3006
CMD ["node", "dist/index.js"]
