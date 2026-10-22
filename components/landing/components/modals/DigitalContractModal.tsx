"use client";
import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, CreditCard, KeyRound } from 'lucide-react';
import { MASTER_WORKER } from '../../data/mockData';
import { SkilledWorker } from '../../types';

interface DigitalContractModalProps {
  isOpen: boolean;
  worker?: SkilledWorker | null;
  onClose: () => void;
  onPaymentReleased: (amount: number, workerName: string) => void;
}

export const DigitalContractModal: React.FC<DigitalContractModalProps> = ({
  isOpen,
  worker = MASTER_WORKER,
  onClose,
  onPaymentReleased
}) => {
  const [pinDigits, setPinDigits] = useState(['4', '9', '2', '0']);
  const [isSigning, setIsSigning] = useState(false);
  const [isReleased, setIsReleased] = useState(false);

  if (!isOpen) return null;

  const currentWorker = worker || MASTER_WORKER;
  const contractId = `DS-CONTR-${currentWorker.id.toUpperCase()}-2026`;
  const agreedAmount = currentWorker.startingRate || 4500;

  const handleReleasePayment = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsReleased(true);
      onPaymentReleased(agreedAmount, currentWorker.name);
    }, 900);
  };

  const handleClose = () => {
    setIsReleased(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#D9D7D0]/60 bg-white/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">
                  Digital Contract Agreement
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  PIN SECURE
                </span>
              </div>
              <h3 className="font-sans text-lg font-bold text-[#1B1B1B]">
                {contractId}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1B1B1B] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contract Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Legal Badge */}
          <div className="p-3.5 rounded-2xl bg-black/5 text-xs text-[#8C8880] flex items-center justify-between font-mono">
            <span>Jurisdiction: Dire Dawa Commercial Court</span>
            <span>Ethiopian Labour Proclamation 1156/2019</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#D9D7D0]/60">
              <span className="text-[10px] font-bold text-[#8C8880] uppercase tracking-wider block mb-1">
                Employer / Client
              </span>
              <p className="text-sm font-bold text-[#1B1B1B]">Homeowner / Project Manager</p>
              <p className="text-xs text-[#8C8880]">Kezira District, Dire Dawa</p>
              <span className="text-[10px] font-semibold text-emerald-600 mt-2 block">✓ Verified Account</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#D9D7D0]/60">
              <span className="text-[10px] font-bold text-[#8C8880] uppercase tracking-wider block mb-1">
                Verified Tradesperson
              </span>
              <p className="text-sm font-bold text-[#1B1B1B]">{currentWorker.name}</p>
              <p className="text-xs text-[#8C8880]">{currentWorker.trade} · {currentWorker.location}</p>
              <span className="text-[10px] font-mono font-semibold text-blue-600 mt-2 block">
                Fayda: {currentWorker.faydaIdNumber || 'ET-FAYDA-VERIFIED'}
              </span>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9D7D0]/60 space-y-2">
            <h4 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-wider">
              Service Scope & Deliverables
            </h4>
            <p className="text-xs text-[#8C8880] leading-relaxed">
              Diagnostic inspection, installation of high-gauge breakers, safety earthing check, and comprehensive circuit isolation. Workmanship guaranteed for 30 calendar days post-delivery.
            </p>
          </div>

          {/* Chapa Payment Breakdown */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-emerald-600" />
                Chapa Direct Payment
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                Direct Settlement
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 uppercase tracking-wider">Agreed Service Fee</span>
                <div className="text-2xl font-extrabold text-emerald-950 font-mono">
                  ETB {agreedAmount.toLocaleString()}
                </div>
              </div>
              <p className="text-xs text-emerald-800 text-right max-w-xs">
                Processed instantly through Chapa via Telebirr, CBE Birr, or cards.
              </p>
            </div>
          </div>

          {/* PIN Release Simulator */}
          {!isReleased ? (
            <div className="p-6 rounded-3xl bg-white border border-[#D9D7D0]/70 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1B1B1B] uppercase tracking-wider">
                <KeyRound size={15} className="text-[#FF416C]" />
                <span>Client 4-Digit Release PIN</span>
              </div>

              <div className="flex justify-center gap-3">
                {pinDigits.map((digit, i) => (
                  <div
                    key={i}
                    className="w-12 h-14 rounded-2xl bg-black/5 border-2 border-black/20 flex items-center justify-center text-xl font-bold font-mono text-[#1B1B1B]"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#8C8880]">
                Client enters this 4-digit code once job delivery is inspected and verified.
              </p>

              <button
                onClick={handleReleasePayment}
                disabled={isSigning}
                className="w-full py-3.5 rounded-full bg-black hover:bg-[#151515] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isSigning ? 'Processing Chapa Transfer...' : `Confirm PIN & Release ETB ${agreedAmount.toLocaleString()}`}
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-sans text-lg font-bold text-emerald-950">
                Payment Released via Chapa!
              </h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                ETB {agreedAmount.toLocaleString()} has been transferred to {currentWorker.name}'s Telebirr account. Contract closed with zero dispute.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-[#D9D7D0]/60 bg-white/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C8880] shrink-0">
          <span>Digital Contract Hash: sha256:7f9a...32c1</span>
          <div className="flex items-center gap-4">
            <a
              href="/client/contract/new"
              className="font-bold text-black hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              Draft Official Contract &rarr;
            </a>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#181818] cursor-pointer"
            >
              Close Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

