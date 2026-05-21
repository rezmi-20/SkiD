"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepIdentityProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function StepIdentity({ formData, setFormData }: StepIdentityProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.fullName")}</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
          placeholder={t("register.fields.fullName.placeholder")}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.email")}</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
          placeholder={t("register.fields.email.placeholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.phone")}</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
            className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
            placeholder={t("register.fields.phone.placeholder")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.dob")}</label>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all font-medium text-[14px] text-white [color-scheme:dark]"
          />
        </div>
      </div>
      <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.gender")}</label>
          <div className="grid grid-cols-2 gap-4">
          {[
            { label: t("register.fields.gender.male"), value: "Male" },
            { label: t("register.fields.gender.female"), value: "Female" }
          ].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: g.value })}
                className={`h-[52px] rounded-2xl font-bold transition-all border text-[13px] ${
                    formData.gender === g.value 
                    ? "bg-green-400 text-black border-green-400 shadow-lg shadow-green-400/10" 
                    : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                }`}
              >
                {g.label}
              </button>
          ))}
          </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.password")}</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full h-[52px] px-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
          placeholder={t("register.fields.password.placeholder")}
        />
      </div>
    </div>
  );
}
