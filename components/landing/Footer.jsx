"use client";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

export default function Footer({ language, setLanguage, t }) {
  const navLinks = [
    { label: t("nav.find_workers"), href: "#services" },
    { label: t("nav.how_it_works"), href: "#howit" },
    { label: t("nav.features"),     href: "#features" },
    { label: t("nav.reviews"),      href: "#reviews" },
    { label: t("nav.faq"),          href: "#faq" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Proclamation 1156/2019", href: "#" },
  ];

  return (
    <footer className="bg-[#09090b] border-t border-white/5 text-left" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">

          {/* Brand column */}
          <div className="space-y-4 md:col-span-2">
            <DireSkillLogo variant="light" iconSize={36} />
            <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-xs">
              {t("footer.about")}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {/* Fayda badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-green-400/20 bg-green-400/5 text-[8px] font-black text-green-400 uppercase tracking-widest">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                Fayda Verified
              </span>
              {/* Chapa badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[8px] font-black text-blue-400 uppercase tracking-widest">
                Chapa
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">{t("footer.resources")}</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Language + Connect */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">{t("footer.language")}</h4>
              <div className="flex flex-col gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "am", label: "አማርኛ (Amharic)" },
                  { code: "om", label: "Afaan Oromoo" },
                ].map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`text-xs font-medium text-left uppercase tracking-widest transition-all ${
                      language === code ? "text-green-400" : "text-zinc-500 hover:text-white"
                    }`}
                    aria-label={`Switch language to ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">{t("footer.connect")}</h4>
              <div className="flex gap-2">
                {[
                  { href: "#", label: "Telegram", icon: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/> },
                  { href: "#", label: "Facebook", icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
                ].map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 bg-white/5 border border-white/8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 hover:border-green-400/20 transition-all"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      {icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest text-center sm:text-left">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[9px] font-medium text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
