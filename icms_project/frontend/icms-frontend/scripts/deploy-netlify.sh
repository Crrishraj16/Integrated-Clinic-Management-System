#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod
