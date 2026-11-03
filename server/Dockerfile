FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o yt-dlp_linux && chmod +x yt-dlp_linux
COPY yt-server.mjs ./
ENV HOST=0.0.0.0
CMD ["node", "yt-server.mjs"]