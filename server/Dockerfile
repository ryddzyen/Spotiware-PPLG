FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
USER node
WORKDIR /home/node/app
COPY --chown=node package*.json ./
RUN npm install --omit=dev
RUN curl -L -o yt-dlp_linux https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux && chmod +x yt-dlp_linux
COPY --chown=node yt-server.mjs ./
ENV PORT=7860
EXPOSE 7860
CMD ["node", "yt-server.mjs"]