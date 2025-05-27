#!/bin/bash

BUILD_ID=DONTKILLME



pm2 stop BlogHomeNuxt

echo "delete files"
rm -rf ./output/*

# ls -lh ./dist.tar.gz
tar -xzvf ./dist.tar.gz -C ./output

pm2 start BlogHomeNuxt
echo "started"

# chmod +x deploy.sh
# cd /blog/nuxt-home/ ./deploy.sh