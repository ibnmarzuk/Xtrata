import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { ParticleEngine } from './components/ParticleEngine';
import { BitcoinBlock } from './components/BitcoinBlock';
import { MagneticButton } from './components/MagneticButton';
import { useAmbientAudio } from './hooks/useAmbientAudio';
import { StarfieldBackground } from './components/StarfieldBackground';

const TOTAL_CHAPTERS = 6; // 1 to 6

export default function App() {
  const [chapter, setChapter] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const { isPlaying, toggleAudio, triggerResonance } = useAmbientAudio();
  const scrollTimeout = useRef<number | null>(null);

  // Trigger audio resonance on final chapter transition
  useEffect(() => {
    if (chapter === 6) {
      triggerResonance();
    }
  }, [chapter, triggerResonance]);

  // Handle Scroll / Wheel to advance chapters
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling) return;

      setIsScrolling(true);
      if (e.deltaY > 50 && chapter < TOTAL_CHAPTERS) {
        setChapter(prev => prev + 1);
      } else if (e.deltaY < -50 && chapter > 1) {
        setChapter(prev => prev - 1);
      }

      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
      scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 1200); // Cooldown for cinematic pacing
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setIsScrolling(true);
        if (chapter < TOTAL_CHAPTERS) setChapter(prev => prev + 1);
        setTimeout(() => setIsScrolling(false), 1200);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setIsScrolling(true);
        if (chapter > 1) setChapter(prev => prev - 1);
        setTimeout(() => setIsScrolling(false), 1200);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    };
  }, [chapter, isScrolling]);

  // Touch handlers for mobile
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isScrolling) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      setIsScrolling(true);
      if (diff > 0 && chapter < TOTAL_CHAPTERS) setChapter(prev => prev + 1);
      else if (diff < 0 && chapter > 1) setChapter(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 1200);
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans selection:bg-[#F7931A] selection:text-[#050505]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Engine */}
      <StarfieldBackground />
      <ParticleEngine chapter={chapter} />
      
      {/* 3D Bitcoin Block for Chapters 4 & 5 */}
      <BitcoinBlock visible={chapter === 4 || chapter === 5} />

      {/* Global UI Overlays */}
      <div className="absolute top-8 w-full px-8 md:px-16 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="text-xs tracking-[0.3em] font-medium opacity-50 uppercase font-display">
          Xtrata
        </div>
        <button 
          onClick={toggleAudio}
          className="opacity-50 hover:opacity-100 transition-opacity duration-300"
          aria-label={isPlaying ? "Mute audio" : "Play audio"}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 mix-blend-difference">
        {Array.from({ length: TOTAL_CHAPTERS }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!isScrolling) {
                setChapter(i + 1);
                setIsScrolling(true);
                setTimeout(() => setIsScrolling(false), 1200);
              }
            }}
            className={`w-1 transition-all duration-500 rounded-full ${chapter === i + 1 ? 'h-8 bg-white opacity-100' : 'h-2 bg-white opacity-20 hover:opacity-50'}`}
            aria-label={`Go to chapter ${i + 1}`}
          />
        ))}
      </div>

      {/* Chapter Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        >
          {chapter === 1 && (
            <div className="text-center px-6">
              <h1 className="font-display text-2xl md:text-4xl font-light tracking-wide text-white opacity-90 leading-relaxed">
                Every masterpiece begins<br />with one idea.
              </h1>
            </div>
          )}

          {chapter === 2 && (
            <div className="text-center px-6 space-y-6">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
                className="font-display text-xl md:text-3xl font-light tracking-wider text-[#F3F4F6]"
              >
                Ideas become sketches.
              </motion.h2>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }}
                className="font-display text-xl md:text-3xl font-light tracking-wider text-[#00F0FF] text-glow-cyan"
              >
                Sketches become creations.
              </motion.h2>
            </div>
          )}

          {chapter === 3 && (
            <div className="relative w-full max-w-4xl h-[60vh] flex items-center justify-center">
              <div className="absolute top-0 left-0 p-4 border-l border-t border-white/20 glass-panel">
                <p className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Sec: 03 | Sys: Architecture</p>
                <p className="text-xs font-mono text-white/80 mt-1">STRUCTURAL_ALIGNMENT_OK</p>
              </div>
              <div className="absolute bottom-0 right-0 p-4 border-r border-b border-white/20 glass-panel">
                <p className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Dim: 4K x 4K | Depth: True</p>
                <p className="text-xs font-mono text-white/80 mt-1">ASSEMBLY_IN_PROGRESS</p>
              </div>
              <div className="glass-panel px-12 py-8 rounded-sm">
                <h2 className="font-sans text-sm tracking-[0.5em] uppercase text-white/60">Phase 03: Creation</h2>
              </div>
            </div>
          )}

          {chapter === 4 && (
            <div className="absolute bottom-24 text-center px-6 space-y-4">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5, duration: 1 }} className="font-sans text-sm md:text-base tracking-widest uppercase text-white">
                Some creations disappear.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.5, duration: 1 }} className="font-sans text-sm md:text-base tracking-widest uppercase text-white">
                Great creations become history.
              </motion.p>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.5 }} className="font-display text-lg md:text-2xl mt-4 text-[#F7931A] tracking-wider text-glow-gold">
                Masterpieces deserve permanence.
              </motion.h2>
            </div>
          )}

          {chapter === 5 && (
            <div className="absolute bottom-1/4 text-center px-6 w-full flex flex-col items-center">
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="font-display text-2xl md:text-4xl font-light tracking-wide text-white mb-4">
                Ideas fade.
              </motion.h2>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1.5 }} className="font-display text-3xl md:text-5xl font-medium tracking-wide text-[#F7931A] text-glow-gold mb-12">
                Masterpieces live forever.
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2.5, duration: 1 }} className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase">
                Preserved on Bitcoin through Xtrata.
              </motion.p>
            </div>
          )}

          {chapter === 6 && (
            <div className="w-full max-w-2xl px-6 pointer-events-auto">
              <div className="glass-panel p-8 md:p-12 rounded-2xl flex flex-col items-center text-center space-y-8 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F7931A] to-transparent opacity-50" />
                
                <div className="space-y-2">
                  <p className="text-xs font-sans uppercase tracking-[0.4em] text-white/50 mb-4">Created by</p>
                  <h3 className="font-display text-2xl md:text-4xl text-white">Abdurrahman Suleiman Bature</h3>
                  <p className="text-sm font-sans text-[#F7931A] tracking-widest">(Ibnmarzuk)</p>
                </div>

                <div className="w-16 h-[1px] bg-white/20" />

                <div className="space-y-1 font-sans text-sm tracking-wider text-white/70">
                  <p>AI Native Software Developer</p>
                  <p>Creative Technologist</p>
                  <p>Builder in Public</p>
                </div>

                <div className="pt-8">
                  <MagneticButton className="bg-white text-black hover:bg-[#F7931A] hover:text-white hover:shadow-[0_0_30px_rgba(247,147,26,0.5)]">
                    Inscribe Your Legacy
                  </MagneticButton>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Down indicator (hide on last chapter) */}
      <AnimatePresence>
        {chapter < TOTAL_CHAPTERS && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-white flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-widest font-sans">Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ArrowDown size={16} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

