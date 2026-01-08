FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Environment variables should be set via docker-compose or runtime, not copied from .env.example

EXPOSE 3000

CMD ["node", "dist/main.js"]
