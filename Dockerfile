FROM node:18-slim

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with --ignore-scripts to prevent premature build
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Now run the build explicitly
RUN npm run build

# Make the script executable
RUN chmod +x build/index.js

# Use CMD with arguments
CMD ["node", "build/index.js"] 