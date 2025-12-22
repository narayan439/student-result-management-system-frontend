# ================================
# Build Angular app
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration production

# ================================
# Serve with Nginx
# ================================
FROM nginx:alpine

# Copy correct Angular build output
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

# Copy nginx config (SPA routing + security)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
