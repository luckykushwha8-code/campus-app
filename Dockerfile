# Production-like dev-friendly Dockerfile (Next.js App Router)
FROM node:18-alpine
WORKDIR /app

# Install dependencies first for layer caching
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
