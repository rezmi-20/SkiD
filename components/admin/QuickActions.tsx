"use client";

import Link from "next/link";
import { UserCheck, Scale, BarChart2, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function QuickActions() {
  const { t } = useLanguage();

  const actions = [
    {
      icon: <UserCheck className="w-4 h-4" />,
      labelKey: "admin.action.verify" as const,
      href: "/admin/verify",
      colorClass: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
    },
    {
      icon: <Scale className="w-4 h-4" />,
      labelKey: "admin.disputes" as const,
      href: "/admin/disputes",
      colorClass: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
    },
    {
      icon: <BarChart2 className="w-4 h-4" />,
      labelKey: "admin.reports" as const,
      href: "/admin/reports",
      colorClass: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200",
    },
    {
      icon: <Settings className="w-4 h-4" />,
      labelKey: "admin.settings" as const,
      href: "/admin/settings",
      colorClass: "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant",
    },
  ];

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest h-full flex flex-col shadow-sm">
      <div className="px-4 py-3 border-b border-outline-variant shrink-0">
        <h3 className="text-sm font-bold text-on-surface tracking-tight">
          {t("admin.quickActions" as any)}
        </h3>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${action.colorClass}`}
          >
            {action.icon}
            <span>{t(action.labelKey as any)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
