import React, { useRef, useEffect, useState } from 'react';
import { Sliders, RefreshCw, Download, Zap } from 'lucide-react';

interface GenerativeCanvasProps {
  onSave?: (dataUrl: string) => void;
}

export function GenerativeCanvas({ onSave }: GenerativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [complexity, setComplexity] = useState(8);
  const [entropy, setEntropy] = useState(0.5);
  const [resonance, setResonance] = useState(0.4);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 600;
    let height = canvas.height = 400;

    // Resize canvas to fit its container container parent
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        width = canvasRef.current.width = containerRef.current.clientWidth;
        height = canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let angle = 0;

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'; // Smooth motion trails
      ctx.fillRect(0, 0, width, height);

      // Draw center display concentric guidelines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      angle += 0.005 * resonance * 10;

      // Draw mathematical golden/cyan helix based on sliders
      ctx.lineWidth = 1.5;
      const radiusMax = Math.min(width, height) * 0.4;
      
      for (let i = 0; i < complexity; i++) {
        const localAngle = angle + (i * Math.PI * 2) / complexity;
        const currentRadius = radiusMax * (0.3 + 0.7 * Math.sin(angle * (entropy * 3) + i));
        
        const x = width / 2 + Math.cos(localAngle) * currentRadius;
        const y = height / 2 + Math.sin(localAngle) * currentRadius;

        // Visual gradients for the lines
        const gradient = ctx.createLinearGradient(width / 2, height / 2, x, y);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(247, 147, 26, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 184, 0, 0.8)');

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        
        // Draw subtle Bezier control curve to add premium fluidity
        const controlX = width / 2 + Math.cos(localAngle + entropy) * (currentRadius * 0.5);
        const controlY = height / 2 + Math.sin(localAngle + entropy) * (currentRadius * 0.5);
        
        ctx.quadraticCurveTo(controlX, controlY, x, y);
        ctx.stroke();

        // Draw small glowing head node
        ctx.fillStyle = '#ffb800';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cursor stroke paths
      if (points.length > 1) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [complexity, entropy, resonance, points]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setPoints([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setPoints(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    if (onSave && canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleRandomize = () => {
    setComplexity(Math.floor(Math.random() * 12) + 4);
    setEntropy(Number((Math.random() * 0.8 + 0.2).toFixed(2)));
    setResonance(Number((Math.random() * 0.8 + 0.2).toFixed(2)));
    setPoints([]);
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl h-[65vh] relative flex flex-col md:flex-row gap-6 glass-panel rounded-2xl p-6 border-white/5 pointer-events-auto">
      {/* Visual Canvas Element */}
      <div className="flex-1 h-full relative bg-[#050505] border border-white/5 rounded-xl overflow-hidden group">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />
        <div className="absolute top-4 left-4 p-3 bg-black/60 rounded-lg border border-white/5 backdrop-blur-sm pointer-events-none">
          <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Interactive Masterpiece Studio</p>
          <p className="text-xs font-mono text-white/80 mt-1">Status: Drawing Allowed</p>
        </div>
        <div className="absolute bottom-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase bg-black/60 px-3 py-1.5 border border-[#00F0FF]/30 rounded-full">
            Drag to paint light path
          </span>
        </div>
      </div>

      {/* Control Panel Panel */}
      <div className="w-full md:w-80 flex flex-col justify-between py-2 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-medium uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Sliders size={14} className="text-[#F7931A]" />
              Parameters
            </span>
            <button
              onClick={handleRandomize}
              className="text-xs font-sans tracking-wider text-[#00F0FF] hover:text-[#ffb800] flex items-center gap-1 transition-colors duration-200"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          {/* Complexity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60">Complexity (Lines)</span>
              <span className="text-[#F7931A]">{complexity}</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              value={complexity}
              onChange={e => setComplexity(Number(e.target.value))}
              className="w-full accent-[#F7931A] cursor-pointer"
            />
          </div>

          {/* Entropy Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60">Entropy (Chaos)</span>
              <span className="text-[#00F0FF]">{entropy}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={entropy}
              onChange={e => setEntropy(Number(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          {/* Resonance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60">Resonance (Speed)</span>
              <span className="text-[#ffb800]">{resonance}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={resonance}
              onChange={e => setResonance(Number(e.target.value))}
              className="w-full accent-[#ffb800] cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <p className="text-[10px] font-mono leading-relaxed text-white/50">
              Your modifications update the physical footprint of the masterpiece, altering the eventual Bitcoin transaction footprint size.
            </p>
          </div>
          <button
            onClick={() => {
              if (onSave && canvasRef.current) {
                onSave(canvasRef.current.toDataURL());
              }
            }}
            className="w-full py-3 bg-white/5 hover:bg-[#F7931A]/10 hover:border-[#F7931A]/30 border border-white/10 text-white hover:text-[#F7931A] rounded-xl text-xs font-sans tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Zap size={14} />
            Capture Masterpiece
          </button>
        </div>
      </div>
    </div>
  );
}
