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
COPY .env.example .env

EXPOSE 3000

CMD ["node", "dist/main"]
