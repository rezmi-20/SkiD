"use client";
import React from 'react';
import { X, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { TradeCard } from '../../types';

interface TeamModalProps {
  card: TradeCard | null;
  onClose: () => void;
  onHire: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ card, onClose, onHire }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="relative h-[220px] sm:h-[260px] w-full shrink-0">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider mb-2 inline-block">
              {card.category} Trade
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl font-bold">
              {card.title}
            </h3>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Verified Quality Standard
              </p>
              <p className="text-base font-bold text-emerald-950">
                {card.impactMetric}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8C8880] uppercase tracking-wider mb-2">
              Trade Overview
            </h4>
            <p className="text-sm text-[#1B1B1B] leading-relaxed">
              {card.details}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8C8880] uppercase tracking-wider mb-3">
              Standard Deliverables Covered
            </h4>
            <div className="space-y-2.5">
              {card.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#D9D7D0]/60"
                >
                  <CheckCircle size={16} className="text-[#FF416C] shrink-0" />
                  <span className="text-xs font-semibold text-[#1B1B1B]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-[#D9D7D0]/50 bg-white/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#8C8880] hover:text-black uppercase tracking-wider"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onHire();
            }}
            className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151515] transition-all flex items-center gap-2"
          >
            <span>Find {card.category}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

