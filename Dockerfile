# =============================================================================
# Worldmaker Monorepo Dockerfile - npm workspaces multi-stage build
# =============================================================================
#
# Build targets:
#   - base: Common dependencies installation
#   - development: Development environment with hot reload
#   - server-builder: Server build stage
#   - server: Production server image (worldmaker-server)
#   - ui-base: Electron UI base with system dependencies
#   - ui-development: Electron UI development with X11 support
#   - ui-builder: UI build stage for distribution packaging
#
# Usage:
#   docker build --target server -t worldmaker-server .
#   docker build --target ui-development -t worldmaker-ui .
#   docker build --target development -t worldmaker-dev .
#
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Common dependencies installation
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install latest npm for better workspace support
RUN npm install -g npm@latest

# Copy package files for npm workspace installation
# Root package files
COPY package.json package-lock.json ./

# Create workspace directories and copy package.json files
# Apps workspace
COPY apps/server/package.json ./apps/server/
COPY apps/ui/package.json ./apps/ui/

# Libs workspace (copy entire directory as it may contain shared modules)
COPY libs/ ./libs/

# Install all workspace dependencies
# Use --ignore-scripts to speed up installation in base stage
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: Development - Hot reload development environment (Server)
# -----------------------------------------------------------------------------
FROM base AS development

# Copy all source files
COPY . .

# Expose ports for server and vite dev server
EXPOSE 3000 5173

# Default command runs the dev server
CMD ["npm", "run", "dev", "-w", "apps/server"]

# -----------------------------------------------------------------------------
# Stage 3: Server Builder - Build the server application
# -----------------------------------------------------------------------------
FROM base AS server-builder

# Copy all source files
COPY . .

# Build the server application
RUN npm run build -w apps/server

# -----------------------------------------------------------------------------
# Stage 4: Server Production - Optimized production server image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS server

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/

# Create libs directory structure
COPY libs/ ./libs/

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts -w apps/server

# Copy built server files from builder stage
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/src ./apps/server/src

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["npm", "run", "start", "-w", "apps/server"]

# -----------------------------------------------------------------------------
# Stage 5: UI Base - Electron with system dependencies for GUI
# -----------------------------------------------------------------------------
FROM node:22-bookworm AS ui-base

# Set working directory
WORKDIR /app

# Install system dependencies required for Electron
# Including X11 libraries for GUI display and additional dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # X11 and display dependencies
    libx11-xcb1 \
    libxcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    libxkbfile1 \
    # GTK and desktop integration
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgbm1 \
    # Audio support
    libasound2 \
    # Networking and security
    libnspr4 \
    libnss3 \
    libcups2 \
    # Fonts
    fonts-liberation \
    fonts-noto-color-emoji \
    # D-Bus for system integration
    dbus \
    libdbus-1-3 \
    # Virtual framebuffer for headless mode
    xvfb \
    # Utilities
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install latest npm for better workspace support
RUN npm install -g npm@latest

# Copy package files for npm workspace installation
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/ui/package.json ./apps/ui/
COPY libs/ ./libs/

# Install all workspace dependencies (including devDependencies for Electron)
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 6: UI Development - Electron development with X11/display support
# -----------------------------------------------------------------------------
FROM ui-base AS ui-development

# Copy all source files
COPY . .

# Environment variables for Electron
ENV DISPLAY=:99
ENV ELECTRON_DISABLE_SANDBOX=1
ENV ELECTRON_ENABLE_LOGGING=1

# API server URL - connects to server service via Docker network
ENV VITE_API_URL=http://worldmaker-server:3000
ENV API_URL=http://worldmaker-server:3000

# Expose Vite dev server port
EXPOSE 5173

# Create startup script for Xvfb + Electron
RUN echo '#!/bin/bash\n\
# Start virtual framebuffer\n\
Xvfb :99 -screen 0 1920x1080x24 &\n\
sleep 2\n\
# Start the UI application\n\
exec npm run dev -w apps/ui\n\
' > /app/start-ui.sh && chmod +x /app/start-ui.sh

# Default command starts Xvfb and the Electron app
CMD ["/app/start-ui.sh"]

# -----------------------------------------------------------------------------
# Stage 7: UI Builder - Build Electron app for distribution
# -----------------------------------------------------------------------------
FROM ui-base AS ui-builder

# Copy all source files
COPY . .

# Build the UI application (Vite + Electron)
RUN npm run build -w apps/ui

# Note: For Electron distribution packaging, use:
# docker build --target ui-builder -t worldmaker-ui-builder .
# docker run --rm -v ./release:/app/apps/ui/release worldmaker-ui-builder npm run dist -w apps/ui

# -----------------------------------------------------------------------------
# Stage 8: UI Headless - For running Electron in headless/testing mode
# -----------------------------------------------------------------------------
FROM ui-base AS ui-headless

# Copy all source files
COPY . .

# Build the application
RUN npm run build -w apps/ui

# Environment for headless operation
ENV DISPLAY=:99
ENV ELECTRON_DISABLE_SANDBOX=1
ENV ELECTRON_ENABLE_LOGGING=1
ENV ELECTRON_NO_ATTACH_CONSOLE=1

# API server URL
ENV API_URL=http://worldmaker-server:3000

# Create startup script with Xvfb for headless operation
RUN echo '#!/bin/bash\n\
# Start virtual framebuffer for headless operation\n\
Xvfb :99 -screen 0 1920x1080x24 &\n\
sleep 2\n\
# Start the built Electron app\n\
exec npm run start -w apps/ui\n\
' > /app/start-headless.sh && chmod +x /app/start-headless.sh

CMD ["/app/start-headless.sh"]