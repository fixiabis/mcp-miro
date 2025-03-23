FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Make the script executable
RUN chmod +x build/index.js

# The command will be provided by smithery.yaml
ENTRYPOINT ["node"] 