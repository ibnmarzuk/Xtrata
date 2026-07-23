import { useEffect, useRef } from 'react';

// Interpolation helper
const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

// Hex to RGB helper
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
}

interface ParticleEngineProps {
  chapter: number;
}

export function ParticleEngine({ chapter }: ParticleEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State refs to keep animation loop decoupled from React renders
  const stateRef = useRef({
    chapter: chapter,
    particles: [] as Particle[],
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    time: 0,
    // Chapter targets
    sparkSize: 0,
    sparkAlpha: 0,
    gridAlpha: 0,
    connectDistance: 0,
    colorTransition: 0, // 0 = white/cyan, 1 = gold
    rotationSpeed: 0,
    orbitRadius: 0
  });

  // Update chapter inside ref when prop changes
  useEffect(() => {
    stateRef.current.chapter = chapter;
  }, [chapter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const state = stateRef.current;

    const handleResize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      canvas.width = state.width;
      canvas.height = state.height;
      state.mouseX = state.width / 2;
      state.mouseY = state.height / 2;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
    };

    const initParticles = () => {
      state.particles = [];
      const numParticles = Math.min(window.innerWidth / 10, 150); // Responsive count
      for (let i = 0; i < numParticles; i++) {
        state.particles.push({
          x: Math.random() * state.width,
          y: Math.random() * state.height,
          baseX: Math.random() * state.width,
          baseY: Math.random() * state.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          targetAlpha: Math.random() * 0.5 + 0.1
        });
      }
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.15})`;
      ctx.lineWidth = 1;
      const gridSize = 100;
      
      const offsetX = (state.mouseX - state.width / 2) * 0.05;
      const offsetY = (state.mouseY - state.height / 2) * 0.05;

      ctx.beginPath();
      for (let x = (state.width / 2) % gridSize + offsetX; x < state.width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, state.height);
      }
      for (let x = (state.width / 2) % gridSize + offsetX; x >= 0; x -= gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, state.height);
      }
      for (let y = (state.height / 2) % gridSize + offsetY; y < state.height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(state.width, y);
      }
      for (let y = (state.height / 2) % gridSize + offsetY; y >= 0; y -= gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(state.width, y);
      }
      ctx.stroke();

      // Blueprint crosshairs
      if (alpha > 0.3) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        const cx = state.width / 2;
        const cy = state.height / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
        
        ctx.arc(cx, cy, 300, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const render = () => {
      state.time += 0.01;
      
      // Update targets based on chapter
      let tSparkSize = 0, tSparkAlpha = 0, tGridAlpha = 0, tConnect = 0, tColor = 0, tRot = 0, tOrbit = 0;
      
      switch (state.chapter) {
        case 1: // The Empty Canvas
          tSparkSize = 4; tSparkAlpha = 1;
          break;
        case 2: // The Spark
          tSparkSize = 100; tSparkAlpha = 0.5; tGridAlpha = 0.2; tConnect = 120;
          break;
        case 3: // Creation
          tSparkSize = 300; tSparkAlpha = 0.1; tGridAlpha = 1.0; tConnect = 180;
          break;
        case 4: // Preservation
          tSparkSize = 0; tSparkAlpha = 0; tGridAlpha = 0.3; tConnect = 150; tColor = 1.0; tOrbit = 1.0; tRot = 0.02;
          break;
        case 5: // Forever
          tGridAlpha = 0.0; tConnect = 80; tColor = 1.0; tOrbit = 0.5; tRot = 0.005;
          break;
        case 6: // Credits
          tGridAlpha = 0.0; tConnect = 100; tColor = 0.5; tOrbit = 0.1;
          break;
      }

      // Lerp state to targets
      state.sparkSize = lerp(state.sparkSize, tSparkSize, 0.05);
      state.sparkAlpha = lerp(state.sparkAlpha, tSparkAlpha, 0.05);
      state.gridAlpha = lerp(state.gridAlpha, tGridAlpha, 0.03);
      state.connectDistance = lerp(state.connectDistance, tConnect, 0.05);
      state.colorTransition = lerp(state.colorTransition, tColor, 0.02);
      state.rotationSpeed = lerp(state.rotationSpeed, tRot, 0.01);
      state.orbitRadius = lerp(state.orbitRadius, tOrbit, 0.02);

      // Colors
      const baseColor = { r: 243, g: 244, b: 246 }; // Soft White
      const goldColor = hexToRgb('#F7931A'); // Bitcoin Gold
      const currR = lerp(baseColor.r, goldColor.r, state.colorTransition);
      const currG = lerp(baseColor.g, goldColor.g, state.colorTransition);
      const currB = lerp(baseColor.b, goldColor.b, state.colorTransition);
      const particleColor = `${Math.round(currR)}, ${Math.round(currG)}, ${Math.round(currB)}`;

      ctx.clearRect(0, 0, state.width, state.height);

      // Draw Grid
      drawGrid(ctx, state.gridAlpha);

      // Draw Spark
      if (state.sparkAlpha > 0.01) {
        const cx = state.width / 2;
        const cy = state.height / 2;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, state.sparkSize);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${state.sparkAlpha})`);
        gradient.addColorStop(0.2, `rgba(0, 240, 255, ${state.sparkAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, state.sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = state.width / 2;
      const cy = state.height / 2;

      // Update and Draw Particles
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];

        // Normal movement
        if (state.orbitRadius < 0.1) {
          p.x += p.vx;
          p.y += p.vy;
          
          // Parallax effect from mouse
          const dx = state.mouseX - cx;
          const dy = state.mouseY - cy;
          p.x -= dx * 0.0005 * p.size;
          p.y -= dy * 0.0005 * p.size;

          // Wrap around
          if (p.x < 0) p.x = state.width;
          if (p.x > state.width) p.x = 0;
          if (p.y < 0) p.y = state.height;
          if (p.y > state.height) p.y = 0;
        } else {
          // Orbit mode (Chapters 4/5)
          const angle = Math.atan2(p.baseY - cy, p.baseX - cx) + state.time * state.rotationSpeed * (p.size * 0.5);
          const dist = Math.hypot(p.baseX - cx, p.baseY - cy) * (1 - state.orbitRadius * 0.5);
          const targetX = cx + Math.cos(angle) * dist;
          const targetY = cy + Math.sin(angle) * dist;
          
          p.x = lerp(p.x, targetX, 0.05);
          p.y = lerp(p.y, targetY, 0.05);
        }

        // Draw particle
        ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles
        if (state.connectDistance > 0) {
          for (let j = i + 1; j < state.particles.length; j++) {
            const p2 = state.particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < state.connectDistance) {
              const lineAlpha = (1 - dist / state.connectDistance) * 0.3 * p.alpha;
              ctx.strokeStyle = `rgba(${particleColor}, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none bg-[#050505]"
    />
  );
}
