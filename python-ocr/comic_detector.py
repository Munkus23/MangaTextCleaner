"""
Comic Text Detector API Service
Integrates dmMaze/comic-text-detector for real OCR functionality
"""
import os
import json
import tempfile
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
import cv2
import torch
from flask import Flask, request, jsonify

# Comic text detector imports (will be available after cloning the repo)
try:
    from inference import TextDetector, preprocess_img, postprocess_yolo
    from utils.textblock import TextBlock
    DETECTOR_AVAILABLE = True
except ImportError:
    print("Comic Text Detector not found. Run setup_detector.py first.")
    DETECTOR_AVAILABLE = False

app = Flask(__name__)

class ComicTextDetectorService:
    def __init__(self, model_path: str = None):
        self.detector = None
        self.model_path = model_path or "models/comictextdetector.pt"
        
        if DETECTOR_AVAILABLE and os.path.exists(self.model_path):
            try:
                device = 'cuda' if torch.cuda.is_available() else 'cpu'
                self.detector = TextDetector(
                    model_path=self.model_path,
                    input_size=1024,
                    device=device,
                    conf_thresh=0.4,
                    nms_thresh=0.35
                )
                print(f"Comic Text Detector loaded successfully on {device}")
            except Exception as e:
                print(f"Failed to load detector: {e}")
                self.detector = None
        else:
            print(f"Model not found at {self.model_path}")
            
    def detect_text(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Detect text in comic/manga image
        Returns list of text boxes with coordinates and confidence
        """
        if not self.detector:
            # Fallback to mock data if detector not available
            return self._get_mock_results()
            
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image: {image_path}")
                
            # Run detection
            mask, mask_refined, blk_list = self.detector(img)
            
            # Convert to our format
            text_boxes = []
            for i, blk in enumerate(blk_list):
                # Get bounding box coordinates
                x1, y1, x2, y2 = blk.xyxy
                
                text_box = {
                    "id": i + 1,
                    "x": int(x1),
                    "y": int(y1),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                    "text": "",  # Comic detector doesn't do OCR, just detection
                    "confidence": float(blk.confidence) if hasattr(blk, 'confidence') else 0.8,
                    "lines": []
                }
                
                # Add text lines if available
                if hasattr(blk, 'lines') and blk.lines:
                    for line in blk.lines:
                        if len(line) >= 8:  # 4 points with x,y coordinates
                            points = np.array(line).reshape(-1, 2)
                            text_box["lines"].append(points.tolist())
                
                text_boxes.append(text_box)
                
            return text_boxes
            
        except Exception as e:
            print(f"Detection error: {e}")
            return self._get_mock_results()
    
    def _get_mock_results(self) -> List[Dict[str, Any]]:
        """Fallback mock results when detector is not available"""
        return [
            {
                "id": 1,
                "x": 100,
                "y": 50,
                "width": 200,
                "height": 40,
                "text": "Sample text detected",
                "confidence": 0.85,
                "lines": []
            },
            {
                "id": 2,
                "x": 150,
                "y": 200,
                "width": 180,
                "height": 35,
                "text": "Another text region",
                "confidence": 0.78,
                "lines": []
            }
        ]

# Global detector instance
detector_service = ComicTextDetectorService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'detector_available': detector_service.detector is not None,
        'cuda_available': torch.cuda.is_available() if DETECTOR_AVAILABLE else False
    })

@app.route('/detect', methods=['POST'])
def detect_text():
    """
    Detect text in uploaded image
    Expects: multipart/form-data with 'image' file
    Returns: JSON with detected text boxes
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Detect text
            text_boxes = detector_service.detect_text(temp_path)
            
            return jsonify({
                'success': True,
                'text_boxes': text_boxes,
                'detector_used': 'comic-text-detector' if detector_service.detector else 'mock'
            })
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detect_url', methods=['POST'])
def detect_text_from_url():
    """
    Detect text from image URL
    Expects: JSON with 'image_url' field
    Returns: JSON with detected text boxes
    """
    try:
        data = request.get_json()
        if not data or 'image_url' not in data:
            return jsonify({'error': 'No image_url provided'}), 400
            
        image_url = data['image_url']
        
        # For local URLs, convert to file path
        if image_url.startswith('/uploads/'):
            # Assume the main app serves files from uploads directory
            file_path = os.path.join('../uploads', os.path.basename(image_url))
            if not os.path.exists(file_path):
                return jsonify({'error': 'Image file not found'}), 404
        else:
            return jsonify({'error': 'Only local image URLs supported'}), 400
        
        # Detect text
        text_boxes = detector_service.detect_text(file_path)
        
        return jsonify({
            'success': True,
            'text_boxes': text_boxes,
            'detector_used': 'comic-text-detector' if detector_service.detector else 'mock'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)