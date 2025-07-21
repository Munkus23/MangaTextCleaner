#!/usr/bin/env python3
"""
Setup script for Comic Text Detector
Downloads the repository and model files
"""
import os
import sys
import subprocess
import urllib.request
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run shell command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False

def download_file(url, dest_path):
    """Download file from URL"""
    try:
        print(f"Downloading {url} to {dest_path}")
        urllib.request.urlretrieve(url, dest_path)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def setup_comic_text_detector():
    """Set up the comic text detector"""
    print("Setting up Comic Text Detector...")
    
    # Clone the repository if it doesn't exist
    if not os.path.exists('comic-text-detector'):
        print("Cloning comic-text-detector repository...")
        if not run_command("git clone https://github.com/dmMaze/comic-text-detector.git"):
            print("Failed to clone repository")
            return False
    
    # Create models directory
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    # Download model files
    model_urls = [
        "https://github.com/zyddnys/manga-image-translator/releases/download/beta-0.2.1/comictextdetector.pt",
        "https://github.com/zyddnys/manga-image-translator/releases/download/beta-0.2.1/comictextdetector.pt.onnx"
    ]
    
    for url in model_urls:
        filename = os.path.basename(url)
        dest_path = models_dir / filename
        
        if not dest_path.exists():
            if not download_file(url, str(dest_path)):
                print(f"Failed to download {filename}")
                # Continue with other files
        else:
            print(f"{filename} already exists")
    
    # Copy required files from comic-text-detector to current directory
    required_files = [
        "inference.py",
        "basemodel.py", 
        "utils/"
    ]
    
    for file_path in required_files:
        src = Path("comic-text-detector") / file_path
        dest = Path(file_path)
        
        if src.exists():
            if src.is_dir():
                if not dest.exists():
                    run_command(f"cp -r {src} {dest}")
            else:
                if not dest.exists():
                    run_command(f"cp {src} {dest}")
            print(f"Copied {file_path}")
        else:
            print(f"Warning: {src} not found")
    
    print("\nSetup complete!")
    print("To test the detector, run: python comic_detector.py")
    return True

if __name__ == "__main__":
    if setup_comic_text_detector():
        print("\n✓ Comic Text Detector setup successful!")
        print("You can now run the OCR service with: python comic_detector.py")
    else:
        print("\n✗ Setup failed!")
        sys.exit(1)