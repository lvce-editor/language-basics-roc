#!/bin/bash

cd "$(dirname "$0")" || exit
cd .. || exit

if ! command -v ncu >/dev/null 2>&1; then
  npm install --global npm-check-updates
fi

ncu --upgrade --reject typescript
npm install
