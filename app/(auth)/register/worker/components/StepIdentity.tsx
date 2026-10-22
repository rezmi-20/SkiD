"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StepIdentityProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function StepIdentity({ formData, setFormData }: StepIdentityProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.fullName")}</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
          placeholder={t("register.fields.fullName.placeholder")}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.email")}</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
          placeholder={t("register.fields.email.placeholder")}
        />
      </div>

      {/* Phone & Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.phone")}</label>
          <div className="relative flex rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all shadow-inner">
            <div className="h-12 px-3 bg-zinc-800/80 border-r border-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-xs select-none">
              +251
            </div>
            <input
              type="tel"
              required
              value={formData.phone}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              onBlur={(e) => {
                const value = e.target.value;
                if (value.startsWith("0") && value.length === 10) {
                  setFormData({ ...formData, phone: value.slice(1) });
                }
              }}
              className="w-full h-12 px-3.5 bg-transparent outline-none placeholder:text-zinc-500 font-medium text-sm text-white"
              placeholder={t("register.fields.phone.placeholder") || "9XX XXX XXX"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.dob")}</label>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full h-12 px-4 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all font-medium text-sm text-white [color-scheme:dark] shadow-inner"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.gender")}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t("register.fields.gender.male"), value: "Male" },
            { label: t("register.fields.gender.female"), value: "Female" }
          ].map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setFormData({ ...formData, gender: g.value })}
              className={`h-12 rounded-xl font-bold transition-all border text-xs active:scale-[0.98] ${
                formData.gender === g.value 
                  ? "bg-green-400 text-black border-green-400 shadow-sm" 
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Password with Eye Toggle */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-300 ml-1">{t("register.fields.password")}</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 pl-4 pr-12 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition-all placeholder:text-zinc-500 font-medium text-sm text-white shadow-inner"
            placeholder={t("register.fields.password.placeholder")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors text-zinc-500 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
