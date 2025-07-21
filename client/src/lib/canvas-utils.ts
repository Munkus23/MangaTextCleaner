export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CanvasUtils {
  static drawImage(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    rect?: Rect
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (rect) {
      ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    } else {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  }

  static drawTextBox(
    canvas: HTMLCanvasElement,
    rect: Rect,
    text: string,
    options: {
      fontSize?: number;
      fontColor?: string;
      backgroundColor?: string;
      isBold?: boolean;
      isItalic?: boolean;
    } = {}
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const {
      fontSize = 14,
      fontColor = '#000000',
      backgroundColor,
      isBold = false,
      isItalic = false,
    } = options;

    // Draw background if specified
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    // Set font style
    let fontStyle = '';
    if (isItalic) fontStyle += 'italic ';
    if (isBold) fontStyle += 'bold ';
    ctx.font = `${fontStyle}${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    ctx.fillText(text, centerX, centerY);
  }

  static applyImageFilter(
    canvas: HTMLCanvasElement,
    filter: 'brightness' | 'contrast' | 'saturation',
    value: number
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filter) {
      case 'brightness':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + value));     // R
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value)); // G
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value)); // B
        }
        break;

      case 'contrast':
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        break;

      case 'saturation':
        const saturation = value / 100;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          data[i] = Math.min(255, Math.max(0, gray + saturation * (r - gray)));
          data[i + 1] = Math.min(255, Math.max(0, gray + saturation * (g - gray)));
          data[i + 2] = Math.min(255, Math.max(0, gray + saturation * (b - gray)));
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  static exportCanvas(canvas: HTMLCanvasElement, filename: string = 'manga-panel.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  }

  static isPointInRect(point: Point, rect: Rect): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }
}
