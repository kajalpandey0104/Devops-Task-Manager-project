# =========================================================================
# 1. BASE IMAGE & ENVIRONMENT SETUP
# =========================================================================
# Using the official lightweight Node.js 20 Alpine Linux image.
# Alpine reduces the container attack surface and image size (~100-150MB vs ~1GB for full Debian).
FROM node:20-alpine

# Set the execution environment to production.
# This optimizes Express.js to run with high performance (e.g., caching views, concise errors).
ENV NODE_ENV=production

# Define the working directory inside the container.
# All subsequent instructions (COPY, RUN, CMD) are executed relative to this path.
WORKDIR /usr/src/app

# =========================================================================
# 2. DEPENDENCY INSTALLATION (CACHED LAYER)
# =========================================================================
# Copy both 'package.json' and 'package-lock.json' to the working directory.
# This is done BEFORE copying the full source code to leverage Docker's layer caching.
# If dependencies haven't changed, Docker reuses this layer, accelerating rebuilds.
COPY package*.json ./

# Install ONLY production dependencies using 'npm ci' (Clean Install).
# --omit=dev ensures devDependencies are skipped, keeping the final image lean.
# 'npm ci' enforces strict alignment with 'package-lock.json' for deterministic builds.
RUN npm ci --omit=dev

# =========================================================================
# 3. SOURCE APPLICATION COPY & PERMISSIONS
# =========================================================================
# Copy all remaining application source files into the container.
# Make sure files not needed in the image are excluded in '.dockerignore' (e.g., node_modules, logs).
COPY . .

# Set ownership of the application directory to the built-in non-root 'node' user.
# Crucial for security: running containers as root increases vulnerabilities during a sandbox escape.
RUN chown -R node:node /usr/src/app

# Switch execution context to the secure non-root 'node' user.
USER node

# =========================================================================
# 4. EXPOSED PORT & ENTRYPOINT
# =========================================================================
# Document that the container services incoming traffic on port 5000.
# Note: This is documentation for orchestrators (like Kubernetes); actual mapping happens at runtime.
EXPOSE 5000

# Execute the application using the Node binary.
# Using the exec form (square brackets) instead of the shell form is critical here:
# It ensures Node.js runs as PID 1, allowing it to correctly capture and handle
# termination signals (SIGINT, SIGTERM) for graceful shutdowns.
CMD ["node", "index.js"]