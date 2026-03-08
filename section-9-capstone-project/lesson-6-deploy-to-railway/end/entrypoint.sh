#!/bin/bash
set -e

mkdir -p /data/workspace /data/botuser/.claude

chown -R botuser:botuser /data

export HOME=/data/botuser

exec gosu botuser "$@"
