# ---------- Stage 1: build the React app with Node ----------
# node:20-alpine is a ~50MB Linux image with Node 20 preinstalled
FROM node:20-alpine AS builder

# All subsequent commands run inside /app
WORKDIR /app

# Copy just package files first — this layer is cached unless deps change
COPY package.json package-lock.json ./

# Install dependencies exactly as pinned in package-lock.json
RUN npm ci

# Now copy the rest of the source code
COPY . .

# Produce a production build into /app/dist
RUN npm run build

# ---------- Stage 2: serve the static files via nginx ----------
# nginx:alpine is ~25MB; the built /app/dist is just static HTML/CSS/JS
FROM nginx:alpine

# Replace the default nginx site config with ours (SPA routing + /api proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from the builder stage into nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Document the port the container listens on (doesn't actually publish it — compose does that)
EXPOSE 80

# Default command: run nginx in the foreground so the container stays alive
CMD ["nginx", "-g", "daemon off;"]
