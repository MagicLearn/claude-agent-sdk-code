FROM oven/bun:1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gosu \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY src ./src

RUN useradd -m -d /data/botuser -s /bin/bash botuser
RUN chown -R botuser:botuser /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bun", "src/bot.ts"]
