# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build
# Node 20 Alpine → install dependencies → build Vite bundle
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci

# ── Supabase build-time secrets ──────────────────────────────────────────────
# We now allow .env in the build context so Vite automatically picks up variables.
# No explicit ARG/ENV mapping is required here.

# Copy the rest of the source code
COPY . .

# Build the production bundle (output → /app/dist)
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Serve
# Lightweight Nginx image to serve the static files
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove the default nginx placeholder
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (handles SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
