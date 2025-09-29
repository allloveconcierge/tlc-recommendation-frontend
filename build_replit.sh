#!/bin/bash

# Build script for Replit deployment
echo "Building frontend..."
cd present-ponder
npm install
npm run build
cd ..

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete! Ready to run with: python -m uvicorn app.asgi:app --host 0.0.0.0 --port 5000"
