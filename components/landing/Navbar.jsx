"use client";

export default function Navbar({ userRole, language, setLanguage, t, isMenuOpen, setIsMenuOpen }) {
  const NAV_LINKS = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.process"), href: "#process" },
    { name: t("nav.services"), href: "#services" },
    { name: t("nav.about"), href: "#about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 py-4">
      <div className="max-w-[95%] mx-auto px-4 md:px-8 xl:px-12 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
              <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
              <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">
            DIRE<span className="text-green-400">SKILL</span>
          </span>
        </div>

        {/* Desktop Navigation Links - spacing/letter-tracking optimized to handle long languages like Oromo on 15-inch viewports */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8 px-6 xl:px-10 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[10px] xl:text-[11px] font-black uppercase tracking-[0.12em] xl:tracking-[0.18em] text-zinc-500 hover:text-green-400 transition-all duration-300 whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
          
          {/* Language Picker Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setLanguage("en")}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${
                language === "en" ? "bg-green-400 text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("am")}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${
                language === "am" ? "bg-green-400 text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              አማ
            </button>
            <button
              onClick={() => setLanguage("om")}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${
                language === "om" ? "bg-green-400 text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              ORO
            </button>
          </div>

          {/* User Auth Buttons */}
          {!userRole ? (
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/login"
                className="px-4 xl:px-5 h-10 flex items-center text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                {t("common.login")}
              </a>
              <a
                href="/register/worker"
                className="bg-green-400 text-black px-5 xl:px-6 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)]"
              >
                {t("common.join")}
              </a>
            </div>
          ) : (
            <a
              href={
                userRole === "admin"
                  ? "/admin/dashboard"
                  : userRole === "worker"
                  ? "/worker/dashboard"
                  : "/client/search"
              }
              className="hidden md:flex bg-white/10 border border-white/10 text-white px-5 xl:px-6 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all whitespace-nowrap"
            >
              {t("nav.dashboard")}
            </a>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 rounded-xl"
            aria-label="Menu"
          >
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>

        </div>
      </div>

      {/* Mobile Drawer (Glass overlay dropdown) */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] p-6 bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/5 z-[90] flex flex-col gap-6 lg:hidden shadow-2xl animate-fade-in text-left">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-400 transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="h-px bg-white/5" />

          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1 w-fit">
            <button
              onClick={() => {
                setLanguage("en");
                setIsMenuOpen(false);
              }}
              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${
                language === "en" ? "bg-green-400 text-black" : "text-zinc-500"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLanguage("am");
                setIsMenuOpen(false);
              }}
              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${
                language === "am" ? "bg-green-400 text-black" : "text-zinc-500"
              }`}
            >
              አማ
            </button>
            <button
              onClick={() => {
                setLanguage("om");
                setIsMenuOpen(false);
              }}
              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${
                language === "om" ? "bg-green-400 text-black" : "text-zinc-500"
              }`}
            >
              ORO
            </button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Mobile Auth Links */}
          {!userRole ? (
            <div className="flex flex-col gap-3">
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full h-12 flex items-center justify-center border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400"
              >
                {t("common.login")}
              </a>
              <a
                href="/register/worker"
                onClick={() => setIsMenuOpen(false)}
                className="w-full h-12 flex items-center justify-center bg-green-400 text-black rounded-xl text-xs font-black uppercase tracking-widest"
              >
                {t("common.join")}
              </a>
            </div>
          ) : (
            <a
              href={
                userRole === "admin"
                  ? "/admin/dashboard"
                  : userRole === "worker"
                  ? "/worker/dashboard"
                  : "/client/search"
              }
              onClick={() => setIsMenuOpen(false)}
              className="w-full h-12 flex items-center justify-center bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest"
            >
              {t("nav.dashboard")}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
