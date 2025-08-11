# Frontend Dockerfile
FROM node:20-alpine AS build
ARG REACT_APP_AUTH_BASE
ENV REACT_APP_AUTH_BASE=${REACT_APP_AUTH_BASE}
WORKDIR /app
COPY Frontend/package.json Frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps || yarn install --frozen-lockfile || true
COPY Frontend/ .
RUN npm run build || yarn build

FROM nginx:alpine AS prod
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .
# Basic caching headers (could override with custom nginx.conf later)
# Example: echo 'add_header Cache-Control "public, max-age=31536000";' > /etc/nginx/conf.d/cache.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
