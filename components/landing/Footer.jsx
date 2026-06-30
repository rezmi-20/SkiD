"use client";

export default function Footer({ language, setLanguage, t }) {
  return (
    <footer className="py-16 px-6 md:px-12 lg:px-24 bg-zinc-955 border-t border-white/5 text-left">
      <div className="max-w-[95%] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
              </svg>
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">DIRE<span className="text-green-400">SKILL</span></span>
          </div>
          <p className="text-zinc-500 text-xs font-black leading-relaxed uppercase tracking-[0.2em] whitespace-pre-line">
            {t("footer.about")}
          </p>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t("footer.resources")}</h4>
          <div className="flex flex-col gap-3">
            <a href="#about" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">{t("nav.about")}</a>
            <a href="#process" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">{t("nav.process")}</a>
            <a href="#services" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">{t("nav.services")}</a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t("footer.language")}</h4>
          <div className="flex flex-col gap-3">
             <button onClick={() => setLanguage('en')} className={`text-xs font-black uppercase tracking-widest text-left transition-all ${language === 'en' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}>English</button>
             <button onClick={() => setLanguage('am')} className={`text-xs font-black uppercase tracking-widest text-left transition-all ${language === 'am' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}>አማርኛ (Amharic)</button>
             <button onClick={() => setLanguage('om')} className={`text-xs font-black uppercase tracking-widest text-left transition-all ${language === 'om' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}>Afaan Oromoo</button>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t("footer.connect")}</h4>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-[95%] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black text-zinc-650 uppercase tracking-widest text-center md:text-left leading-normal">
          {t("footer.copyright")}
        </p>
        <p className="text-[9px] font-black text-zinc-650 uppercase tracking-widest text-center md:text-right leading-normal">
          {t("footer.developed")}
        </p>
      </div>
    </footer>
  );
}
