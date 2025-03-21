# Base image with Bun.js
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy all
COPY . /app/

# Install dependencies
RUN bun install

# Define arguments for runtime configuration
ARG PRIVATE_KEY
ARG CERTIFICATE
ARG PORT
ARG ORIGIN

# Set environment variables using the provided ARGs
ENV PRIVATE_KEY=${PRIVATE_KEY}
ENV CERTIFICATE=${CERTIFICATE}
ENV PORT=${PORT}
ENV ORIGIN=${ORIGIN}

# Expose the port from environment variables
EXPOSE ${PORT}

# Command to run your application
ENTRYPOINT ["bun", "run", "serve"]
