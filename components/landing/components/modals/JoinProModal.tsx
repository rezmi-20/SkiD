"use client";
import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Sparkles, AlertCircle } from 'lucide-react';

interface JoinProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (name: string, trade: string) => void;
}

export const JoinProModal: React.FC<JoinProModalProps> = ({ isOpen, onClose, onRegistered }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [fullName, setFullName] = useState('');
  const [trade, setTrade] = useState('Electrician');
  const [kebele, setKebele] = useState('Kebele 02 (Kezira)');
  const [phone, setPhone] = useState('+251 9');
  const [faydaNumber, setFaydaNumber] = useState('ET-FAYDA-');
  const [experience, setExperience] = useState('5+ years');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const trades = [
    'Electrician',
    'Plumber',
    'Painter',
    'Satellite Dish',
    'House Finishing',
    'Carpenter',
    'Welder'
  ];

  const kebeles = [
    'Kebele 01 (Kezira)',
    'Kebele 02 (Kazira / Taiwan)',
    'Kebele 03 (Dechatu)',
    'Kebele 04 (Sabian)',
    'Kebele 05 (Megala)',
    'Kebele 06 (Gende Kore)',
    'Kebele 07',
    'Kebele 08',
    'Kebele 09'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      onRegistered(fullName || 'Professional', trade);
    }, 1200);
  };

  const handleReset = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden relative">
        <button
          onClick={handleReset}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1B1B1B] transition-colors z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {step === 'form' ? (
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF416C]"></span>
              <span className="text-[11px] font-bold text-[#8C8880] uppercase tracking-widest font-mono">
                Dire Dawa University ICT Innovation Lab
              </span>
            </div>

            <h3 className="font-sans text-2xl md:text-3xl font-bold text-[#1B1B1B] mb-2">
              Join DireSkill as a Professional
            </h3>
            <p className="text-xs sm:text-sm text-[#8C8880] mb-6">
              Get certified with your National Fayda ID, sign digital contracts, and receive secure Chapa payouts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1B1B1B] mb-1.5">
                    Full Legal Name (as on Fayda ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ahmed Kedir"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D7D0] text-sm text-[#1B1B1B] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B1B1B] mb-1.5">
                    Primary Trade
                  </label>
                  <select
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D7D0] text-xs font-semibold text-[#1B1B1B] focus:outline-none focus:border-black"
                  >
                    {trades.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1B1B1B] mb-1.5">
                    Phone Number (Telebirr Enabled)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+251 91 234 5678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D7D0] text-sm text-[#1B1B1B] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B1B1B] mb-1.5">
                    Dire Dawa District / Kebele
                  </label>
                  <select
                    value={kebele}
                    onChange={e => setKebele(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D7D0] text-xs font-semibold text-[#1B1B1B] focus:outline-none focus:border-black"
                  >
                    {kebeles.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fayda ID Submission */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>National Fayda Digital ID Verification</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Fayda Identification Number (FIN / FAN)
                    </label>
                    <input
                      type="text"
                      required
                      value={faydaNumber}
                      onChange={e => setFaydaNumber(e.target.value)}
                      placeholder="ET-FAYDA-XXXX-XXXX"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-mono text-[#1B1B1B] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-dashed border-blue-300 flex items-center justify-between text-xs text-blue-800">
                    <span className="flex items-center gap-1.5">
                      <Upload size={14} /> Fayda Document / QR Upload
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Auto-Audited
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-black hover:bg-[#151515] text-white text-xs font-bold uppercase tracking-wider shadow-xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Validating with Fayda Registry...</span>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-[#FF416C]" />
                      <span>Submit Application for Fayda Audit</span>
                    </>
                  )}
                </button>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C8880]">
                  <a
                    href="/register/worker"
                    className="font-bold text-black hover:text-[#00E575] transition-colors"
                  >
                    Complete Official Worker Account &rarr;
                  </a>
                  <a
                    href="/login"
                    className="hover:text-black transition-colors"
                  >
                    Already verified? Log in
                  </a>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>

            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
              Phase 02: Admin Audit
            </span>

            <h3 className="font-sans text-2xl font-bold text-[#1B1B1B] mb-2">
              Registration Received!
            </h3>

            <p className="text-sm text-[#8C8880] max-w-sm mb-6">
              Welcome, <strong className="text-[#1B1B1B]">{fullName || 'Professional'}</strong>. Our verification team is auditing your Fayda ID <code className="bg-black/5 px-1 py-0.5 rounded text-xs">{faydaNumber}</code> against national records.
            </p>

            <div className="w-full bg-white rounded-2xl p-4 border border-[#D9D7D0]/60 mb-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8C8880]">Trade Category:</span>
                <span className="font-semibold text-[#1B1B1B]">{trade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8880]">Location:</span>
                <span className="font-semibold text-[#1B1B1B]">{kebele}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8880]">Direct Chapa Payout:</span>
                <span className="font-semibold text-emerald-700">Pre-Configured</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors cursor-pointer"
              >
                Done
              </button>
              <a
                href="/register/worker"
                className="px-6 py-3 rounded-full border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              >
                Finish Setup in App &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

