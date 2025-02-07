#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🏗️ Building the application..."
npm run build

# Move to the dist directory
cd dist

echo "✅ Build complete! Ready for deployment."

# Note: Add your deployment commands here based on your hosting provider
# For example, if using Firebase:
# firebase deploy
# Or if using AWS S3:
# aws s3 sync . s3://your-bucket-name
