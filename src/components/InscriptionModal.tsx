import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Landmark, ShieldCheck, HelpCircle, Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArtwork: string | null;
}

export function InscriptionModal({ isOpen, onClose, savedArtwork }: InscriptionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [feeRate, setFeeRate] = useState(45); // sat/vB
  const [address, setAddress] = useState('tb1p8x...09hvy7');
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState('Broadcasting payload...');
  const [progress, setProgress] = useState(0);

  // Simulated validation
  const [addressError, setAddressError] = useState('');

  // Handle step 2 simulated mining sequence
  useEffect(() => {
    if (step !== 2) return;

    setProgress(0);
    setLoadingText('Initiating Xtrata protocol...');

    const timer1 = setTimeout(() => {
      setProgress(25);
      setLoadingText('Broadcasting transaction to mempool...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setProgress(55);
      setLoadingText('Waiting for miner confirmation...');
    }, 3500);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setLoadingText('Writing witness payload to witness block...');
    }, 6000);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setStep(3);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [step]);

  const handleInscribe = () => {
    if (!address || address.length < 10) {
      setAddressError('Please enter a valid Taproot (bc1p...) or Segwit address.');
      return;
    }
    setAddressError('');
    setStep(2);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl glass-panel rounded-3xl border-white/10 shadow-2xl p-6 md:p-8 overflow-hidden pointer-events-auto"
        >
          {/* Top orange gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F7931A] to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors duration-200 p-2 -m-2 touch-manipulation cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Step content */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#F7931A] uppercase">Bitcoin Inscription Studio</span>
                <h3 className="font-display text-2xl font-light text-white">Inscribe Your Legacy</h3>
                <p className="text-sm text-white/60">
                  Configure fee rates and recipient credentials to permanently imprint your generative masterpiece.
                </p>
              </div>

              {savedArtwork ? (
                <div className="aspect-[4/2.5] w-full rounded-xl border border-white/5 bg-[#0a0a0a] overflow-hidden relative group">
                  <img src={savedArtwork} alt="Your generative masterpiece" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <p className="text-[10px] font-mono text-white/50 tracking-wider">PAYLOAD_READY (Data URI Scheme)</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/2.5] w-full rounded-xl border border-white/5 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <HelpCircle className="text-white/20" size={32} />
                  <p className="text-xs font-mono text-white/40">No custom artwork was captured. Inscribing default theme profile state instead.</p>
                </div>
              )}

              {/* Inscription Details Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-widest">Bitcoin Destination Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => {
                      setAddress(e.target.value);
                      if (e.target.value.length > 5) setAddressError('');
                    }}
                    placeholder="Enter bc1p... or segwit address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F7931A]/50 font-mono transition-all duration-300"
                  />
                  {addressError && <p className="text-xs text-red-400 font-mono">{addressError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white/50 uppercase tracking-widest">Target Fee Rate</span>
                    <span className="text-[#F7931A] font-semibold">{feeRate} sat/vB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={feeRate}
                    onChange={e => setFeeRate(Number(e.target.value))}
                    className="w-full accent-[#F7931A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>10 sat/vB (Low)</span>
                    <span>150 sat/vB (High Priority)</span>
                  </div>
                </div>
              </div>

              {/* CTA Action Button */}
              <button
                onClick={handleInscribe}
                className="w-full py-4 bg-white text-black hover:bg-[#F7931A] hover:text-white hover:shadow-[0_0_30px_rgba(247,147,26,0.5)] font-sans font-semibold rounded-2xl tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <Cpu size={16} />
                Begin Inscription
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative flex items-center justify-center">
                {/* Visual loading ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-white/10 border-t-[#F7931A]"
                />
                <Landmark className="absolute text-[#F7931A]" size={36} />
              </div>

              <div className="space-y-2">
                <h4 className="font-display text-lg font-light text-white">{loadingText}</h4>
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#F7931A] to-[#ffb800]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs font-mono text-white/40 mt-1">{progress}% Complete</p>
              </div>

              <p className="text-xs text-white/50 max-w-xs leading-relaxed font-sans">
                Xtrata is chunking the generative art script payload, preparing taproot witness inputs, and awaiting block confirmations.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F7931A] to-[#ffb800]/10 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(247,147,26,0.4)]">
                <ShieldCheck className="text-white" size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">Scribe Confirmed</span>
                <h3 className="font-display text-2xl font-light text-white">Immutable Legacy Registered</h3>
                <p className="text-sm text-white/60">
                  Your masterpiece has been successfully inscribed on the Bitcoin blockchain.
                </p>
              </div>

              {/* Transaction Receipt Details */}
              <div className="glass-panel p-4 rounded-xl space-y-3 text-left border-white/5 bg-[#0a0a0a] font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">Inscription ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80">6b7a90f1...e89ci0</span>
                    <button onClick={() => handleCopy('6b7a90f14d8bc07c813a4ef719001389cb432109')} className="text-white/40 hover:text-[#F7931A] p-1">
                      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/40">Fee rate</span>
                  <span className="text-white/80">{feeRate} sat/vB</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/40">Status</span>
                  <span className="text-green-400 font-semibold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    Mined
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/40">Block Height</span>
                  <span className="text-white/80">#853,248</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/10 hover:border-white/30 text-white/80 hover:text-white rounded-xl text-xs font-sans tracking-widest uppercase transition-all duration-300 cursor-pointer"
                >
                  Inscribe Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#F7931A] text-white hover:bg-[#ffb800] rounded-xl text-xs font-sans tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Close
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
