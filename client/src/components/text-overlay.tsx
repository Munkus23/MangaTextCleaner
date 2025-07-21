import { useState, useCallback } from "react";
import { type TextBox } from "@shared/schema";

interface TextOverlayProps {
  textBox: TextBox;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export default function TextOverlay({
  textBox,
  isSelected,
  onSelect,
  onDeselect,
}: TextOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [isSelected, onSelect, onDeselect]);

  return (
    <div
      className={`text-overlay ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${textBox.x}px`,
        top: `${textBox.y}px`,
        width: `${textBox.width}px`,
        height: `${textBox.height}px`,
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Confidence Badge */}
      {(isHovered || isSelected) && textBox.confidence && (
        <div className="absolute -top-6 left-0 bg-secondary text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {textBox.originalText ? 'Text detected' : 'New text'} {textBox.confidence && `(${textBox.confidence}%)`}
        </div>
      )}

      {/* Text Content Preview */}
      {textBox.editedText && isSelected && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-1 text-center text-xs"
          style={{
            color: textBox.fontColor || '#000000',
            fontSize: `${Math.max(8, Math.min(textBox.fontSize || 14, textBox.height / 3))}px`,
            fontWeight: textBox.isBold ? 'bold' : 'normal',
            fontStyle: textBox.isItalic ? 'italic' : 'normal',
            textDecoration: textBox.isUnderline ? 'underline' : 'none',
            backgroundColor: textBox.backgroundColor || 'transparent',
          }}
        >
          {textBox.editedText}
        </div>
      )}
    </div>
  );
}
