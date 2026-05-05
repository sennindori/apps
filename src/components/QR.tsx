import React from 'react';
import QRious from 'qrious';

interface QRProps {
  value: string;
  size?: number;
  color?: string;
}

export function QR({ value, size = 200, color = "#00A99D" }: QRProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      new QRious({
        element: canvasRef.current,
        value: value,
        size: size,
        foreground: color,
        background: 'transparent',
        level: 'H'
      });
    }
  }, [value, size, color]);

  return <canvas ref={canvasRef} className="max-w-full h-auto" />;
}
