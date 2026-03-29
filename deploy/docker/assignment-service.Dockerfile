FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/assignment-service/package*.json /workspace/backend/services/assignment-service/
RUN cd /workspace/backend/services/assignment-service && npm install

COPY backend/services/assignment-service /workspace/backend/services/assignment-service
RUN cd /workspace/backend/services/assignment-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/assignment-service/package*.json /app/
COPY --from=builder /workspace/backend/services/assignment-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/assignment-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3004
CMD ["node", "dist/index.js"]
