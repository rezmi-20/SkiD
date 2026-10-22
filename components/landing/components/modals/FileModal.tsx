"use client";
import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { SkilledFile } from '../../types';

interface FileModalProps {
  file: SkilledFile | null;
  onClose: () => void;
}

export const FileModal: React.FC<FileModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Header Bar */}
        <div className="p-6 md:p-8 border-b border-[#D9D7D0]/50 flex items-center justify-between shrink-0 bg-white/60">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${file.color}15`, color: file.color }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-xl md:text-2xl font-bold text-[#1B1B1B]">
                  {file.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#1B1B1B] uppercase tracking-wider">
                  {file.type}
                </span>
              </div>
              <p className="text-xs text-[#8C8880] mt-0.5">
                {file.size} · Updated {file.lastUpdated}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1B1B1B] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-[#D9D7D0]/60 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#8C8880] block mb-1">Author / Authority</span>
              <p className="font-semibold text-[#1B1B1B]">{file.author}</p>
            </div>
            <div>
              <span className="text-[#8C8880] block mb-1">Validation Status</span>
              <p className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Active & Documented
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8C8880] uppercase tracking-wider mb-2">
              Overview
            </h4>
            <p className="text-sm text-[#1B1B1B] leading-relaxed">
              {file.description}
            </p>
          </div>

          {file.content?.sections && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#8C8880] uppercase tracking-wider">
                Specification Details
              </h4>
              {file.content.sections.map((sec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/70 border border-[#D9D7D0]/60">
                  <h5 className="text-xs font-bold text-[#1B1B1B] mb-1">{sec.title}</h5>
                  <p className="text-xs text-[#8C8880] leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-[#D9D7D0]/50 bg-white/70 flex items-center justify-between text-xs text-[#8C8880]">
          <span>DireSkill · Proclamation 1156/2019</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-black text-white font-semibold text-xs hover:bg-[#181818]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

