#!/bin/bash
# Keep-alive script for Next.js dev server
while true; do
  echo "[$(date)] Starting Next.js dev server..."
  npx next dev -p 3000
  echo "[$(date)] Server crashed, restarting in 2s..."
  sleep 2
done
