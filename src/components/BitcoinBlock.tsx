import { motion } from 'motion/react';
import { Bitcoin } from 'lucide-react';

interface BitcoinBlockProps {
  visible: boolean;
}

export function BitcoinBlock({ visible }: BitcoinBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        scale: visible ? 1 : 0.8,
        rotateY: visible ? 0 : 90 
      }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-64 h-64 pointer-events-none perspective-[1000px]"
    >
      <motion.div 
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: 360, rotateX: [10, -10, 10] }}
        transition={{ 
          rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 flex items-center justify-center glass-panel-gold rounded-2xl border-2 border-[#F7931A]/30 backdrop-blur-xl shadow-[0_0_50px_rgba(247,147,26,0.3)]"
          style={{ transform: 'translateZ(32px)' }}
        >
          <Bitcoin size={96} className="text-[#F7931A] drop-shadow-[0_0_15px_rgba(247,147,26,0.8)]" />
        </div>
        
        {/* Back Face */}
        <div 
          className="absolute inset-0 glass-panel-gold rounded-2xl border border-[#F7931A]/10"
          style={{ transform: 'rotateY(180deg) translateZ(32px)' }}
        />

        {/* Side Panels (Depth) - Top/Bottom/Left/Right simulated simply */}
        <div className="absolute inset-x-0 top-0 h-[64px] bg-[#F7931A]/10 border border-[#F7931A]/20 transform origin-top rotateX(-90deg)" />
        <div className="absolute inset-x-0 bottom-0 h-[64px] bg-[#F7931A]/10 border border-[#F7931A]/20 transform origin-bottom rotateX(90deg)" />
        <div className="absolute inset-y-0 left-0 w-[64px] bg-[#F7931A]/10 border border-[#F7931A]/20 transform origin-left rotateY(90deg)" />
        <div className="absolute inset-y-0 right-0 w-[64px] bg-[#F7931A]/10 border border-[#F7931A]/20 transform origin-right rotateY(-90deg)" />
      </motion.div>
    </motion.div>
  );
}
