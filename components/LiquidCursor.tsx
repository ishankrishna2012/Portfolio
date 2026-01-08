import React, { useEffect, useState, useRef } from 'react';

interface Props {
  isLoading?: boolean;
}

const LiquidCursor: React.FC<Props> = ({ isLoading = false }) => {
  // Use Refs for values that change every frame (performance)
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  
  // React State for appearance (changes less frequently)
  const [dimensions, setDimensions] = useState({ width: 20, height: 20, radius: '50%' });
  const [isHovering, setIsHovering] = useState(false);
  const [isInverse, setIsInverse] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [magneticEl, setMagneticEl] = useState<HTMLElement | null>(null);

  // Helper: Linear Interpolation
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Detect Theme Changes
  useEffect(() => {
    const checkTheme = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Update dimensions when magnetic element changes
  useEffect(() => {
      if (magneticEl) {
          const rect = magneticEl.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(magneticEl);
          setDimensions({
              width: rect.width + 8, // slight padding
              height: rect.height + 8,
              radius: computedStyle.borderRadius === '0px' ? '8px' : computedStyle.borderRadius
          });
      } else {
          setDimensions({ width: 20, height: 20, radius: '50%' });
      }
  }, [magneticEl]);

  useEffect(() => {
    let animationFrameId: number;
    
    // 1. Track Mouse Input (Raw Data)
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // 2. Physics Loop (Smooth Animation)
    const loop = () => {
      let targetX = mousePos.current.x;
      let targetY = mousePos.current.y;
      
      // Magnetic Physics Calculation
      if (magneticEl) {
         const rect = magneticEl.getBoundingClientRect();
         const centerX = rect.left + rect.width / 2;
         const centerY = rect.top + rect.height / 2;
         
         // "Elastic" Magnetism: Pull towards center, but allow some movement with mouse
         // The 0.3 factor dampens the mouse movement relative to the center
         targetX = centerX + (mousePos.current.x - centerX) * 0.3;
         targetY = centerY + (mousePos.current.y - centerY) * 0.3;
      }

      // Smoothness Factor (Lower = Slower/Smoother, Higher = Snappier)
      // We use a slightly higher factor for magnetic elements to feel "tight"
      const smoothness = magneticEl ? 0.25 : 0.12;

      // Interpolate Current Position towards Target Position
      currentPos.current.x = lerp(currentPos.current.x, targetX, smoothness);
      currentPos.current.y = lerp(currentPos.current.y, targetY, smoothness);

      // Apply to DOM directly for 60fps+ performance
      if (cursorRef.current) {
        // Using translate3d for GPU acceleration
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(loop);
    };
    
    // Start Loop
    animationFrameId = requestAnimationFrame(loop);

    window.addEventListener('mousemove', onMouseMove);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const clickable = target.closest('a, button, input, textarea, [role="button"], .cursor-pointer, select, [role="switch"]');
      setIsHovering(!!clickable);

      const magnet = target.closest('button, a, [role="button"], .magnetic, input, select, [role="switch"]');
      setMagneticEl(magnet as HTMLElement || null);

      const inverseZone = target.closest('.inverse-cursor-zone');
      setIsInverse(!!inverseZone);
    };

    const handleMouseOut = () => {
         setMagneticEl(null);
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [magneticEl]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  // Calculate Colors
  let r = 0, g = 0, b = 0;
  
  if (isLoading) {
      r = 255; g = 255; b = 255;
  } else if (isDark) {
      if (isInverse) { r = 0; g = 0; b = 0; }
      else { r = 255; g = 255; b = 255; }
  } else {
      if (isInverse) { r = 255; g = 255; b = 255; }
      else { r = 0; g = 0; b = 0; }
  }

  // 10% transparency when magnetic (0.1), otherwise standard hover/idle opacities
  const opacity = magneticEl ? 0.1 : (isHovering ? 0.15 : 0.8);

  return (
    <>
      <style>{`
        html, body, *, a, button, input, textarea, select { 
            cursor: none !important; 
        }
        .simple-cursor {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 2147483647;
            /* Transform is handled by JS for performance */
            will-change: transform, width, height, border-radius;
            transition: 
                width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), 
                height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
                border-radius 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
                background-color 0.2s ease,
                opacity 0.2s ease,
                backdrop-filter 0.2s ease;
        }
      `}</style>
      
      <div 
        ref={cursorRef}
        className="simple-cursor"
        style={{
            // Initial position off-screen
            transform: `translate3d(-100px, -100px, 0) translate(-50%, -50%)`,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            borderRadius: dimensions.radius,
            backgroundColor: `rgba(${r}, ${g}, ${b}, 1)`,
            opacity: opacity,
            backdropFilter: magneticEl ? 'blur(0px)' : 'none',
        }}
      />
    </>
  );
};

export default LiquidCursor;