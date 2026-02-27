FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

RUN npm prune --omit=dev

USER node

EXPOSE 3000

CMD ["node", "server.js"]
