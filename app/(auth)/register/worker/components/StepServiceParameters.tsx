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
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.expertise.title")}</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleSkill(cat)}
              className={`px-5 h-[42px] rounded-full text-[11px] font-bold transition-all border ${
                formData.skills.includes(cat)
                  ? "bg-green-400 text-black border-green-400 shadow-md shadow-green-400/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.expertise.portfolio")}</label>
        <textarea
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full h-32 px-4 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 text-[14px] font-medium outline-none transition-all placeholder:text-zinc-600 leading-relaxed no-scrollbar"
          placeholder={t("register.expertise.portfolio.placeholder")}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.expertise.location")}</label>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 font-bold text-[14px] outline-none transition-all [color-scheme:dark]"
        >
          <option value="">{t("register.expertise.location.placeholder")}</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
