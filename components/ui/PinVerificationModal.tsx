"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
  title?: string;
  description?: string;
}

export default function PinVerificationModal({ isOpen, onClose, onVerify, title = "Verification Required", description = "Enter your 4-digit security PIN to authorize this signature." }: Props) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError(false);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join("");
    if (fullPin.length === 4) {
      onVerify(fullPin);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
            
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{description}</p>
              </div>

              <div className="flex justify-center gap-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-14 h-16 bg-zinc-800 border-2 rounded-2xl text-center text-2xl font-black text-white focus:outline-none transition-all ${
                      error ? 'border-red-500/50' : digit ? 'border-green-400/50 bg-green-400/5' : 'border-white/5 focus:border-green-400/30'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[10px] text-red-500 font-black text-center uppercase tracking-widest">
                  Please enter all 4 digits
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={pin.some(d => !d)}
                  className="w-full h-12 bg-green-400 hover:bg-green-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Confirm Signature
                </button>
                <button
                  onClick={onClose}
                  className="w-full h-12 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
