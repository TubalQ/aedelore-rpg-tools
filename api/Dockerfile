FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package.json ./

# Install all dependencies (including devDependencies for testing)
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
