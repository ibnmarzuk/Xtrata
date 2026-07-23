import { useEffect, useRef, useState, useCallback } from 'react';

export function useAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const startAudio = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current!;

    // Create main gain (volume control)
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Start quiet, fade in
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Create a lowpass filter for atmospheric muddiness
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Deep hum
    filter.Q.value = 2;
    filter.connect(masterGain);

    // Create LFO to modulate the filter for a "breathing" effect
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // Very slow (20 second cycle)
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; // Modulate frequency by +/- 200Hz
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    lfoRef.current = lfo;

    // Base drone (A1 = 55Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    
    // Harmony 1 (A2 = 110Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 110;

    // Harmony 2 (E3 = 164.81Hz, perfect fifth)
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle'; // Slightly more harmonics
    osc3.frequency.value = 164.81;
    
    // Mix them
    const oscGain1 = ctx.createGain(); oscGain1.gain.value = 0.6;
    const oscGain2 = ctx.createGain(); oscGain2.gain.value = 0.3;
    const oscGain3 = ctx.createGain(); oscGain3.gain.value = 0.1;

    osc1.connect(oscGain1).connect(filter);
    osc2.connect(oscGain2).connect(filter);
    osc3.connect(oscGain3).connect(filter);

    osc1.start();
    osc2.start();
    osc3.start();

    oscillatorsRef.current = [osc1, osc2, osc3];

    // Fade in
    masterGain.gain.setTargetAtTime(0.5, ctx.currentTime, 2);
    setIsPlaying(true);
  }, [initAudio]);

  const stopAudio = useCallback(() => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    // Fade out
    gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 1);
    
    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch (e) {}
      }
      oscillatorsRef.current = [];
      setIsPlaying(false);
    }, 1500);
  }, []);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }, [isPlaying, startAudio, stopAudio]);

  const triggerResonance = useCallback(() => {
    if (!audioCtxRef.current || !isPlaying || !gainNodeRef.current) return;
    
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Create a new oscillator for the high-frequency resonance
    const resOsc = ctx.createOscillator();
    resOsc.type = 'sine';
    resOsc.frequency.value = 440; // A4
    
    const resOsc2 = ctx.createOscillator();
    resOsc2.type = 'sine';
    resOsc2.frequency.value = 444; // Slightly detuned for beating
    
    const resOsc3 = ctx.createOscillator();
    resOsc3.type = 'sine';
    resOsc3.frequency.value = 659.25; // E5

    const resGain = ctx.createGain();
    resGain.gain.setValueAtTime(0, now);
    resGain.gain.linearRampToValueAtTime(0.15, now + 2); // Swell up over 2 seconds
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 8); // Decay over 6 seconds

    // Add some subtle modulation
    const modOsc = ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 4; // 4Hz vibrato
    const modGain = ctx.createGain();
    modGain.gain.value = 5; // +/- 5Hz
    modOsc.connect(modGain);
    modGain.connect(resOsc.frequency);
    modGain.connect(resOsc2.frequency);
    modGain.connect(resOsc3.frequency);

    resOsc.connect(resGain);
    resOsc2.connect(resGain);
    resOsc3.connect(resGain);
    
    // Connect to destination directly, bypassing the lowpass filter for clarity
    resGain.connect(ctx.destination);
    
    resOsc.start(now);
    resOsc2.start(now);
    resOsc3.start(now);
    modOsc.start(now);
    
    resOsc.stop(now + 10);
    resOsc2.stop(now + 10);
    resOsc3.stop(now + 10);
    modOsc.stop(now + 10);
  }, [isPlaying]);

  return { isPlaying, toggleAudio, triggerResonance };
}
