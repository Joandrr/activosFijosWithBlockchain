# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies (including Hardhat and developer dependencies)
RUN npm install

# Copy configuration and contract files
COPY . .

# Expose Hardhat node default port
EXPOSE 8545

# Start the local Hardhat Node bound to all interfaces (0.0.0.0)
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
