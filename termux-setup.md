# Deploying Manga Panel Editor to Termux

## Prerequisites

First, install Termux from F-Droid (recommended) or Google Play Store, then set up the development environment:

```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js and essential tools
pkg install nodejs git

# Verify installation
node --version
npm --version
```

## Installation Steps

1. **Clone or transfer the project files**:
```bash
# If using git
git clone <your-repo-url>
cd manga-panel-editor

# Or transfer files using adb/file manager
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create uploads directory**:
```bash
mkdir -p uploads
```

4. **Start the application**:
```bash
# Option 1: Standard development server (localhost only)
npm run dev

# Option 2: Network accessible server (recommended for Termux)
chmod +x start-termux.sh
./start-termux.sh

# Option 3: Manual with environment variables
HOST=0.0.0.0 npm run dev
```

The app will be available at:
- Local: `http://localhost:5000`  
- Network: `http://[your-ip]:5000`

## Termux-Specific Optimizations

### Storage Access
- The app uses local file storage in the `uploads/` directory
- Files are automatically served via Express static middleware
- No external cloud dependencies required

### Network Access
- App runs on localhost by default
- Access from other devices on same network using your device's IP
- No external API dependencies for core functionality

### Performance Considerations
- OCR service is modular - can be disabled for lighter operation
- Canvas operations optimized for mobile performance
- PWA features work offline after initial load

## Usage in Termux

1. **Start the server**:
```bash
npm run dev
```

2. **Access the app**:
   - Local: `http://localhost:5000`
   - Network: `http://[your-ip]:5000` (find IP with `ifconfig`)

3. **Upload manga panels**:
   - Drag and drop works in most Termux browsers
   - File picker accessible via "Upload Panel" button

4. **OCR functionality**:
   - Currently simulated for development
   - Ready for Comic Text Detector integration when available

## Limitations in Termux

- Camera access may be limited depending on browser
- File system access restricted to app directory
- Large image processing may be slower on older devices

## Optional Enhancements

### Using Real OCR (when available)
The app is designed to easily integrate Comic Text Detector or other OCR services:

```javascript
// In client/src/lib/ocr-service.ts
export async function detectText(imageUrl: string) {
  // Replace mock implementation with real OCR API call
  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
```

### Port Configuration
To run on a different port:

```bash
# Edit package.json scripts or set environment variable
PORT=3000 npm run dev
```