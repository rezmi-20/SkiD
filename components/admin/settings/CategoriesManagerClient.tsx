"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, CheckCircle2, Edit3, Plus, Power, Trash2 } from "lucide-react";
import FadeContent from "@/components/ui/fade-content";
import { useFeedback } from "@/components/ui/feedback";
import {
  deleteServiceCategory,
  toggleServiceCategoryActive,
  upsertServiceCategory,
  type ServiceCategoryRow,
} from "@/lib/actions/master-data";

export function CategoriesManagerClient({ initialCategories }: { initialCategories: ServiceCategoryRow[] }) {
  const router = useRouter();
  const { confirmDialog, toast } = useFeedback();
  const [categories, setCategories] = useState<ServiceCategoryRow[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameOm, setNameOm] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setEditingId(null);
    setNameEn("");
    setNameAm("");
    setNameOm("");
    setSlug("");
    setDescription("");
    setSortOrder(categories.length + 1);
  };

  const startEdit = (cat: ServiceCategoryRow) => {
    setEditingId(cat.id);
    setNameEn(cat.nameEn);
    setNameAm(cat.nameAm || "");
    setNameOm(cat.nameOm || "");
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await upsertServiceCategory({
        id: editingId,
        slug: slug || undefined,
        nameEn,
        nameAm,
        nameOm,
        description,
        sortOrder,
      });
      if (!res.success) {
        toast.error(res.error || "Could not save category.");
        return;
      }
      toast.success(editingId ? "Service category updated." : "Service category added.");
      resetForm();
      router.refresh();
    });
  };

  const handleToggle = (cat: ServiceCategoryRow) => {
    startTransition(async () => {
      const res = await toggleServiceCategoryActive(cat.id, !cat.isActive);
      if (!res.success) {
        toast.error(res.error || "Could not update status.");
        return;
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c)),
      );
      toast.success(cat.isActive ? `"${cat.nameEn}" disabled.` : `"${cat.nameEn}" enabled.`);
      router.refresh();
    });
  };

  const handleDelete = async (cat: ServiceCategoryRow) => {
    const ok = await confirmDialog({
      title: `Delete "${cat.nameEn}"?`,
      description:
        cat.linkedWorkerCount > 0 || cat.linkedJobCount > 0
          ? `This category is linked to ${cat.linkedWorkerCount} worker(s) and ${cat.linkedJobCount} job(s). Deleting linked categories is blocked—disable it instead.`
          : "This unused category will be permanently removed and logged in the audit trail.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteServiceCategory(cat.id);
      if (!res.success) {
        toast.error(res.error || "Cannot delete linked category.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success(`"${cat.nameEn}" deleted.`);
      router.refresh();
    });
  };

  return (
    <FadeContent blur duration={0.25} className="space-y-6 pb-20 w-full">
      <div className="space-y-2">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Platform Settings</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Service Categories Master Data
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage DireSkill skilled trade categories across English, Amharic, and Afaan Oromo. Linked categories must be soft-disabled rather than deleted.
            </p>
          </div>
          <Link
            href="/admin/settings/zones"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition self-start"
          >
            <span>Manage Dire Dawa Zones →</span>
          </Link>
        </div>
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent" />
            <span>{editingId ? "Edit Service Category" : "Add New Service Category"}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">English Name *</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Solar Technician"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Amharic Label (አማርኛ)</label>
            <input
              type="text"
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              placeholder="e.g. የሶላር ቴክኒሻን"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Afaan Oromo Label</label>
            <input
              type="text"
              value={nameOm}
              onChange={(e) => setNameOm(e.target.value)}
              placeholder="e.g. Ogeessa Soolarii"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Slug (auto if blank)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="solar-technician"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Sort Order</label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short scope summary"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition disabled:opacity-40"
        >
          {editingId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{editingId ? "Update Category" : "Create Category"}</span>
        </button>
      </form>

      {/* Categories Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Category (EN / AM / OM)</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Linked Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {categories.map((cat) => {
                const isLinked = cat.linkedWorkerCount > 0 || cat.linkedJobCount > 0;
                return (
                  <tr key={cat.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="font-bold text-foreground">{cat.nameEn}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[cat.nameAm, cat.nameOm].filter(Boolean).join(" · ") || "No localized labels"}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-foreground">
                        {cat.linkedWorkerCount} workers · {cat.linkedJobCount} jobs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          cat.isActive
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggle(cat)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground font-semibold"
                          title={cat.isActive ? "Soft-disable" : "Enable"}
                        >
                          <Power className="w-3 h-3" />
                          <span>{cat.isActive ? "Disable" : "Enable"}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(cat)}
                          className={`p-1.5 rounded-lg border transition ${
                            isLinked
                              ? "border-border text-muted-foreground/50 hover:text-destructive"
                              : "border-destructive/30 text-destructive hover:bg-destructive/10"
                          }`}
                          title={isLinked ? "Linked categories cannot be deleted (soft-disable instead)" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FadeContent>
  );
}
