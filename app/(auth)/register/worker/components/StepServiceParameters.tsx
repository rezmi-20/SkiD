"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepServiceParametersProps {
  formData: any;
  setFormData: (data: any) => void;
  toggleSkill: (skill: string) => void;
  categories: string[];
  locations: string[];
}

export default function StepServiceParameters({ 
  formData, 
  setFormData, 
  toggleSkill, 
  categories, 
  locations 
}: StepServiceParametersProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Trade Skills Multi-select */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[13px] font-medium text-zinc-300">
            {t("register.expertise.title")} <span className="text-red-400">*</span>
          </label>
          <span className="text-[11px] text-zinc-500">
            {formData.skills.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = formData.skills.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleSkill(cat)}
                className={`px-4 h-10 rounded-full text-xs font-bold transition-all border active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-green-400 text-black border-green-400 shadow-sm"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {isSelected && <span>✓</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience / Bio */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.expertise.portfolio")}</label>
        <textarea
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full h-28 px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 text-sm font-medium outline-none transition-all placeholder:text-zinc-600 leading-relaxed shadow-inner resize-none"
          placeholder={t("register.expertise.portfolio.placeholder")}
        />
      </div>

      {/* Location / District */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.expertise.location")} <span className="text-red-400">*</span></label>
        <div className="relative">
          <select
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 font-semibold text-sm outline-none transition-all [color-scheme:dark] shadow-inner text-white cursor-pointer"
          >
            <option value="">{t("register.expertise.location.placeholder")}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
