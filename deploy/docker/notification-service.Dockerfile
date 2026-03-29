FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/notification-service/package*.json /workspace/backend/services/notification-service/
RUN cd /workspace/backend/services/notification-service && npm install

COPY backend/services/notification-service /workspace/backend/services/notification-service
RUN cd /workspace/backend/services/notification-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/notification-service/package*.json /app/
COPY --from=builder /workspace/backend/services/notification-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/notification-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3008
CMD ["node", "dist/index.js"]
