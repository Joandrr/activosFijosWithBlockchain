# Use official Node.js image
FROM node:20-alpine

# Install postgresql-client for pg_isready health checks
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies (including devDependencies like tsx and typescript)
RUN npm install

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose backend port
EXPOSE 3000

# Start server (command will be overridden in docker-compose.yml to run migrations first)
CMD ["npm", "run", "start"]
