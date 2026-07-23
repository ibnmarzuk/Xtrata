import { useEffect, useRef } from 'react';

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const stars: { x: number; y: number; z: number; size: number; alpha: number }[] = [];
    let numStars = 150;

    const initStars = () => {
      numStars = Math.min(Math.floor(width / 5), 200);
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 2000,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random()
        });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const now = Date.now() * 0.001;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        if (!star) continue;

        // Slowly drift towards the viewer
        star.z -= 0.5;

        // Reset if it goes past the viewer
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 2000;
        }

        // Project 3D to 2D
        const k = 1000 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        // Only draw if on screen
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const currentSize = star.size * k;
          // Fade in based on distance
          const currentAlpha = Math.min(star.alpha, (2000 - star.z) / 1000);
          
          // Twinkle effect (using cached precalculated time 'now' instead of multiple Date.now() calls)
          const twinkle = Math.sin(now + i) * 0.5 + 0.5;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * twinkle * 0.8})`;
          ctx.beginPath();
          ctx.arc(px, py, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
    />
  );
}
