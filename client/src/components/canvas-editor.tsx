import { useRef, useEffect, useState, useCallback } from "react";
import { type MangaProject, type TextBox } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Home,
  Upload,
  Play,
  CloudUpload
} from "lucide-react";
import TextOverlay from "@/components/text-overlay";
import { useCanvas } from "@/hooks/use-canvas";

interface CanvasEditorProps {
  project: MangaProject | null;
  textBoxes: TextBox[];
  selectedTool: string;
  selectedTextBox: TextBox | null;
  onTextBoxSelect: (textBox: TextBox | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function CanvasEditor({
  project,
  textBoxes,
  selectedTool,
  selectedTextBox,
  onTextBoxSelect,
  onDragOver,
  onDrop,
  onFileUpload,
  isLoading,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const {
    zoomLevel,
    panX,
    panY,
    zoomIn,
    zoomOut,
    fitToScreen,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas({
    canvasRef,
    containerRef,
    imageWidth: project?.width || 0,
    imageHeight: project?.height || 0,
  });

  useEffect(() => {
    if (!project || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = project.width;
    canvas.height = project.height;

    // Load and draw image
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, project.width, project.height);
    };
    img.src = project.originalImageUrl;
  }, [project]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDropInternal = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e);
  }, [onDrop]);

  return (
    <div className="h-full relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800">Processing Image</h3>
              <p className="text-gray-600">Detecting text with Comic Text Detector...</p>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary bg-opacity-10 border-4 border-dashed border-primary rounded-lg flex items-center justify-center text-center z-40 drag-overlay">
          <div className="space-y-4">
            <CloudUpload className="w-16 h-16 text-primary mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-primary">Drop your manga panel here</h3>
              <p className="text-gray-600">Supports JPG, PNG formats</p>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="h-full flex items-center justify-center p-8 canvas-container overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragOver={onDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropInternal}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {project ? (
          <div 
            className="relative"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
              transformOrigin: '0 0',
            }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full rounded-lg shadow-lg border border-gray-200"
            />
            
            {/* Text Overlays */}
            {textBoxes.map((textBox) => (
              <TextOverlay
                key={textBox.id}
                textBox={textBox}
                isSelected={selectedTextBox?.id === textBox.id}
                onSelect={() => onTextBoxSelect(textBox)}
                onDeselect={() => onTextBoxSelect(null)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">Start editing your manga</h2>
              <p className="text-gray-600 max-w-md">Upload a manga panel to begin OCR text detection and editing. Supports JPG and PNG formats.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileUpload(file);
                  }
                }}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-6 py-3"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <Button 
                variant="outline"
                className="flex items-center px-6 py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {project && (
        <div className="floating-toolbar bg-white rounded-lg shadow-lg border border-gray-200 tool-panel">
          <div className="flex items-center p-2 space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-3 py-2 text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={fitToScreen}
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetView}
              title="Reset View"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
