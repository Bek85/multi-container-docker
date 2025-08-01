# Use Node.js 22 Alpine image as base (lightweight Linux distribution)
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock first (for better caching)
COPY package.json .

# Install dependencies using yarn
RUN yarn install

# Copy all remaining source code into the container
COPY . .

# Build the client
CMD ["yarn", "build"]
