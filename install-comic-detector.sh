#!/bin/bash
# Installation script for Comic Text Detector integration

echo "🚀 Setting up Comic Text Detector for Manga Panel Editor..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3 first."
    echo "In Termux: pkg install python"
    exit 1
fi

# Create python-ocr directory if it doesn't exist
if [ ! -d "python-ocr" ]; then
    echo "❌ python-ocr directory not found. Run this script from the project root."
    exit 1
fi

cd python-ocr

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "🔧 Setting up Comic Text Detector..."
python3 setup_detector.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up Comic Text Detector"
    exit 1
fi

echo "✅ Comic Text Detector setup complete!"
echo ""
echo "To start the OCR service:"
echo "  cd python-ocr"
echo "  python3 comic_detector.py"
echo ""
echo "Or use the start script:"
echo "  ./start-with-ocr.sh"