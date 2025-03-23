FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set executable permissions for the entry point
RUN chmod +x build/index.js

# The binary expects token to be passed as argument or env var
# Smithery will handle passing the token via the smithery.yaml config
CMD ["node", "build/index.js"] 