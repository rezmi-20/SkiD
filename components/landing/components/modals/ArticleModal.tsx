"use client";
import React from 'react';
import { X, ArrowLeft, Clock, Share2 } from 'lucide-react';
import { SkillArticle } from '../../types';

interface ArticleModalProps {
  article: SkillArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col relative">
        {/* Navigation Bar */}
        <div className="p-6 border-b border-[#D9D7D0]/50 flex items-center justify-between shrink-0 bg-white/70">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#FF416C] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Updates
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1B1B1B] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 md:p-12 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8C8880] uppercase tracking-wider">
            <span className="text-[#FF416C] font-bold">{article.category}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {article.readTime}
            </span>
          </div>

          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1B1B1B] leading-tight">
            {article.title}
          </h2>

          <div className="flex items-center gap-3.5 py-4 border-y border-[#D9D7D0]/40">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-white shadow-xs"
            />
            <div>
              <p className="text-sm font-bold text-[#1B1B1B]">{article.author.name}</p>
              <p className="text-xs text-[#8C8880]">{article.author.role}</p>
            </div>
          </div>

          {/* Lead Image matching exact card visual */}
          <div className="w-full h-[280px] sm:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-black/5 my-4">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-lg md:text-xl text-[#1B1B1B] font-medium leading-relaxed font-sans">
            {article.excerpt}
          </p>

          <div className="space-y-4 text-base text-[#1B1B1B]/85 leading-relaxed font-normal">
            {article.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-[#D9D7D0]/50 bg-white/70 flex items-center justify-between text-xs text-[#8C8880]">
          <span>DireSkill Research Bulletin</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-black text-white font-semibold text-xs hover:bg-[#181818]"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};

