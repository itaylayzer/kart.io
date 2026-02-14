# Base image with Bun.js
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy all
COPY . /app/

# Install dependencies
RUN bun install --cwd server
# RUN bun add --cwd server @colyseus/bun-websockets

# Define arguments for runtime configuration
ENV NODE_ENV="production"

ARG PORT
ARG ORIGIN

ENV PORT=${PORT}
ENV ORIGIN=${ORIGIN}

# Expose the port from environment variables
EXPOSE ${PORT}

# Command to run your application
CMD ["bun", "run", "--cwd", "server", "src/index.ts"]
