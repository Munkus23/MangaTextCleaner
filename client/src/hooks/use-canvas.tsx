import { useState, useCallback, useRef, useEffect } from "react";

interface UseCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  imageWidth: number;
  imageHeight: number;
}

export function useCanvas({
  canvasRef,
  containerRef,
  imageWidth,
  imageHeight,
}: UseCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !imageWidth || !imageHeight) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 64; // Account for padding
    const containerHeight = container.clientHeight - 64;
    
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    setZoomLevel(scale);
    setPanX(0);
    setPanY(0);
  }, [imageWidth, imageHeight]);

  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.1), 5);
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Auto-fit when image dimensions change
  useEffect(() => {
    if (imageWidth && imageHeight) {
      fitToScreen();
    }
  }, [imageWidth, imageHeight, fitToScreen]);

  return {
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
  };
}
