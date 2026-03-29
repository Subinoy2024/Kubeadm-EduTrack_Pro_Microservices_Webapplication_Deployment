FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/user-service/package*.json /workspace/backend/services/user-service/
RUN cd /workspace/backend/services/user-service && npm install

COPY backend/services/user-service /workspace/backend/services/user-service
RUN cd /workspace/backend/services/user-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/user-service/package*.json /app/
COPY --from=builder /workspace/backend/services/user-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/user-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3002
CMD ["node", "dist/index.js"]
