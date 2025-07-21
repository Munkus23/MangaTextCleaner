#!/bin/bash
# Start both the main application and Comic Text Detector service

echo "🚀 Starting Manga Panel Editor with Comic Text Detector..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down services..."
    kill $OCR_PID $APP_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Check if Comic Text Detector is set up
if [ ! -f "python-ocr/comic_detector.py" ]; then
    echo "❌ Comic Text Detector not found. Run ./install-comic-detector.sh first"
    exit 1
fi

# Start OCR service in background
echo "🔍 Starting Comic Text Detector service..."
cd python-ocr
python3 comic_detector.py &
OCR_PID=$!
cd ..

# Wait a moment for OCR service to start
sleep 3

# Check if OCR service is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "⚠️  OCR service not responding, continuing with mock data"
else
    echo "✅ Comic Text Detector service running on port 5001"
fi

# Start main application
echo "🌐 Starting main application..."
npm run dev &
APP_PID=$!

echo ""
echo "🎉 Services started!"
echo "   📱 Main app: http://localhost:5000"
echo "   🔍 OCR service: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for either process to exit
wait