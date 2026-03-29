FROM node:20-alpine AS builder
WORKDIR /workspace

COPY backend/services/course-service/package*.json /workspace/backend/services/course-service/
RUN cd /workspace/backend/services/course-service && npm install

COPY backend/services/course-service /workspace/backend/services/course-service
RUN cd /workspace/backend/services/course-service && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/backend/services/course-service/package*.json /app/
COPY --from=builder /workspace/backend/services/course-service/node_modules /app/node_modules
COPY --from=builder /workspace/backend/services/course-service/dist /app/dist

RUN chmod -R a+rX /app
USER 1001

EXPOSE 3003
CMD ["node", "dist/index.js"]
