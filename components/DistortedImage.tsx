import React, { useRef, useEffect, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

const DistortedImage: React.FC<Props> = ({ src, alt, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";

    let animationId: number;
    let time = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create wobble effect using slicing
      // We draw horizontal slices of the image, shifting their X position based on sine wave
      const w = canvas.width;
      const h = canvas.height;
      
      // Draw standard image first (if you want less distortion, uncomment next line)
      // ctx.drawImage(img, 0, 0, w, h);

      const amplitude = 5; // How far it wobbles
      const frequency = 0.02; // How many waves
      const speed = 0.05; // Animation speed

      for (let y = 0; y < h; y += 2) { // Skip lines for performance
        // Calculate shift
        const xShift = Math.sin(y * frequency + time) * amplitude;
        
        // Draw slice
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // We take a 1px high slice from source and draw it shifted on canvas
        // We map the source image size to the canvas size
        const sy = (y / h) * img.height;
        const sHeight = (2 / h) * img.height;

        ctx.drawImage(
            img, 
            0, sy, img.width, sHeight, // Source
            xShift, y, w + (amplitude * 2), 2 // Dest (slightly wider to cover gaps)
        );
      }

      time += speed;
      animationId = requestAnimationFrame(render);
    };

    img.onload = () => {
      setIsLoaded(true);
      // Resize canvas to match container
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
      render();
    };

    img.onerror = () => {
        setHasError(true);
    };

    const handleResize = () => {
        if (containerRef.current) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [src]);

  // Fallback if canvas/image fails
  if (hasError) {
      return <img src={src} alt={alt} className={`${className} object-cover`} />;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        {/* Helper image to maintain aspect ratio/size in DOM if needed, hidden but taking space */}
        <img src={src} alt={alt} className="opacity-0 w-full h-full object-cover absolute inset-0 -z-10" />
        
        <canvas ref={canvasRef} className="block w-full h-full object-cover" />
    </div>
  );
};

export default DistortedImage;