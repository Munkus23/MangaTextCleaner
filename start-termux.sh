#!/bin/bash
# Startup script for Termux deployment

echo "Starting Manga Panel Editor for Termux..."

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Set environment variables for Termux
export HOST=0.0.0.0
export NODE_ENV=development

# Get the IP address for network access
IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')

echo "Starting server..."
echo "Local access: http://localhost:5000"
echo "Network access: http://$IP:5000"
echo ""
echo "Press Ctrl+C to stop the server"

# Start the development server
npx tsx server/index.ts