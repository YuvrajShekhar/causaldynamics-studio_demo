FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# VITE_API_URL is baked in at build time - point it at your deployed backend URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# The official nginx image auto-runs envsubst on every *.template file in
# /etc/nginx/templates/ at container startup, writing the result to
# /etc/nginx/conf.d/ (stripping the .template suffix). That's how $PORT gets
# substituted at runtime - Railway (or any host) can set PORT to whatever it
# wants without us rebuilding the image.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=80
EXPOSE $PORT
CMD ["nginx", "-g", "daemon off;"]
