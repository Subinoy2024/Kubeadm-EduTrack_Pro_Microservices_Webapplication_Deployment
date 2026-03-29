FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/meeting-service/package*.json /workspace/backend/services/meeting-service/
RUN cd /workspace/backend/services/meeting-service && npm install

COPY backend/services/meeting-service /workspace/backend/services/meeting-service
RUN cd /workspace/backend/services/meeting-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/meeting-service/package*.json /app/
COPY --from=builder /workspace/backend/services/meeting-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/meeting-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3005
CMD ["node", "dist/index.js"]
