FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema and application code
COPY prisma ./prisma/
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

EXPOSE 3000

# Start mapping migrations on startup before booting NextJS
CMD ["sh", "-c", "npx prisma db push && npm start"]
