FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY backend/database/package*.json /app/backend/database/
RUN cd /app/backend/database && npm install

COPY backend/database /app/backend/database
WORKDIR /app/backend/database

RUN chmod -R a+rX /app
USER 1001

CMD ["sh", "-lc", "npm run migrate && npm run seed"]
