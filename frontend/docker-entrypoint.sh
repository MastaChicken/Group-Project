#!/bin/sh

set -e

# Debug
# exec npm run dev

# Production
npm run build:dev
exec npm run serve:dev
