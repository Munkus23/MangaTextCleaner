# Comic Text Detector Service

This directory contains the Python microservice that integrates the real Comic Text Detector for manga/comic OCR functionality.

## Setup

1. **Install Python dependencies**:
```bash
cd python-ocr
pip install -r requirements.txt
```

2. **Set up Comic Text Detector**:
```bash
python setup_detector.py
```

This will:
- Clone the comic-text-detector repository
- Download the pre-trained models (~200MB)
- Copy necessary files to the current directory

3. **Start the OCR service**:
```bash
python comic_detector.py
```

The service will run on port 5001 by default.

## API Endpoints

### Health Check
```bash
GET /health
```
Returns service status and detector availability.

### Detect Text (File Upload)
```bash
POST /detect
Content-Type: multipart/form-data

# Upload image file
curl -X POST -F "image=@manga_page.jpg" http://localhost:5001/detect
```

### Detect Text (URL)
```bash
POST /detect_url
Content-Type: application/json

{
  "image_url": "/uploads/filename.jpg"
}
```

## Integration with Main App

The main Express server will proxy OCR requests to this Python service. No changes needed to the frontend - it will automatically use the real Comic Text Detector when available.

## Fallback Behavior

If the Comic Text Detector is not available (models not downloaded, dependencies missing), the service falls back to mock data to ensure the main application continues working.

## GPU Support

The detector automatically uses CUDA if available. For better performance on systems with NVIDIA GPUs, ensure PyTorch is installed with CUDA support:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Model Files

The setup script downloads:
- `comictextdetector.pt` - PyTorch model (~200MB)
- `comictextdetector.pt.onnx` - ONNX version for OpenCV DNN

## Termux Compatibility

This service works in Termux with CPU-only inference:
```bash
# In Termux
pkg install python git
pip install -r requirements.txt
python setup_detector.py
python comic_detector.py
```

The main manga editor application will automatically detect and use this service when it's running.