import React from 'react';
import QRious from 'qrious';

export function QR({ value, size = 200, color = "#00A99D" }) {
  const canvasRef = React.useRef(null);

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
