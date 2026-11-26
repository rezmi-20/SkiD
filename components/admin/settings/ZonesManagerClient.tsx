"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Edit3, MapPin, Plus, Power, Trash2 } from "lucide-react";
import FadeContent from "@/components/ui/fade-content";
import { useFeedback } from "@/components/ui/feedback";
import {
  deleteZone,
  toggleZoneActive,
  upsertZone,
  type ZoneRow,
} from "@/lib/actions/master-data";

export function ZonesManagerClient({ initialZones }: { initialZones: ZoneRow[] }) {
  const router = useRouter();
  const { confirmDialog, toast } = useFeedback();
  const [zones, setZones] = useState<ZoneRow[]>(initialZones);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [nameOm, setNameOm] = useState("");
  const [slug, setSlug] = useState("");
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [radiusKm, setRadiusKm] = useState("3.0");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setEditingId(null);
    setNameEn("");
    setNameAm("");
    setNameOm("");
    setSlug("");
    setCenterLat("");
    setCenterLng("");
    setRadiusKm("3.0");
    setSortOrder(zones.length + 1);
  };

  const startEdit = (zone: ZoneRow) => {
    setEditingId(zone.id);
    setNameEn(zone.nameEn);
    setNameAm(zone.nameAm || "");
    setNameOm(zone.nameOm || "");
    setSlug(zone.slug);
    setCenterLat(zone.centerLat !== null ? String(zone.centerLat) : "");
    setCenterLng(zone.centerLng !== null ? String(zone.centerLng) : "");
    setRadiusKm(String(zone.radiusKm || 3.0));
    setSortOrder(zone.sortOrder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await upsertZone({
        id: editingId,
        slug: slug || undefined,
        nameEn,
        nameAm,
        nameOm,
        city: "Dire Dawa",
        centerLat: centerLat || null,
        centerLng: centerLng || null,
        radiusKm,
        sortOrder,
      });
      if (!res.success) {
        toast.error(res.error || "Could not save zone.");
        return;
      }
      toast.success(editingId ? "Zone updated." : "Zone added.");
      resetForm();
      router.refresh();
    });
  };

  const handleToggle = (zone: ZoneRow) => {
    startTransition(async () => {
      const res = await toggleZoneActive(zone.id, !zone.isActive);
      if (!res.success) {
        toast.error(res.error || "Could not update zone status.");
        return;
      }
      setZones((prev) =>
        prev.map((z) => (z.id === zone.id ? { ...z, isActive: !zone.isActive } : z)),
      );
      toast.success(zone.isActive ? `"${zone.nameEn}" disabled.` : `"${zone.nameEn}" enabled.`);
      router.refresh();
    });
  };

  const handleDelete = async (zone: ZoneRow) => {
    const ok = await confirmDialog({
      title: `Delete "${zone.nameEn}"?`,
      description:
        zone.linkedWorkerCount > 0 || zone.linkedJobCount > 0
          ? `This zone is linked to ${zone.linkedWorkerCount} worker(s) and ${zone.linkedJobCount} job(s). Deleting linked zones is blocked—disable it instead.`
          : "This unused zone will be permanently removed and logged in the audit trail.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteZone(zone.id);
      if (!res.success) {
        toast.error(res.error || "Cannot delete linked zone.");
        return;
      }
      setZones((prev) => prev.filter((z) => z.id !== zone.id));
      toast.success(`"${zone.nameEn}" deleted.`);
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
              Dire Dawa Neighborhoods & Zones
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure neighborhood centroids and service radii used for worker directory & coarse geolocation matching. Linked zones must be soft-disabled instead of deleted.
            </p>
          </div>
          <Link
            href="/admin/settings/categories"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition self-start"
          >
            <span>Manage Service Categories →</span>
          </Link>
        </div>
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{editingId ? "Edit Dire Dawa Zone" : "Add New Dire Dawa Zone"}</span>
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
            <label className="text-xs font-semibold text-foreground">Zone Name (EN) *</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Kezira"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Amharic Label (አማርኛ)</label>
            <input
              type="text"
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              placeholder="e.g. ቀዚራ"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Afaan Oromo Label</label>
            <input
              type="text"
              value={nameOm}
              onChange={(e) => setNameOm(e.target.value)}
              placeholder="e.g. Keziraa"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Center Latitude</label>
            <input
              type="number"
              step="any"
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value)}
              placeholder="9.5931"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Center Longitude</label>
            <input
              type="number"
              step="any"
              value={centerLng}
              onChange={(e) => setCenterLng(e.target.value)}
              placeholder="41.8596"
              className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Radius (km) & Sort Order</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
              />
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition disabled:opacity-40"
        >
          {editingId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{editingId ? "Update Zone" : "Create Zone"}</span>
        </button>
      </form>

      {/* Zones Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Neighborhood / Zone</th>
                <th className="py-3 px-4">Centroid & Radius</th>
                <th className="py-3 px-4">Linked Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {zones.map((zone) => {
                const isLinked = zone.linkedWorkerCount > 0 || zone.linkedJobCount > 0;
                return (
                  <tr key={zone.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="font-bold text-foreground">{zone.nameEn}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[zone.nameAm, zone.nameOm].filter(Boolean).join(" · ") || zone.slug}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {zone.centerLat !== null && zone.centerLng !== null
                        ? `${zone.centerLat.toFixed(4)}, ${zone.centerLng.toFixed(4)} (${zone.radiusKm} km)`
                        : `Default radius (${zone.radiusKm} km)`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-foreground">
                        {zone.linkedWorkerCount} workers · {zone.linkedJobCount} jobs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          zone.isActive
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                      >
                        {zone.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(zone)}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggle(zone)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground font-semibold"
                          title={zone.isActive ? "Soft-disable" : "Enable"}
                        >
                          <Power className="w-3 h-3" />
                          <span>{zone.isActive ? "Disable" : "Enable"}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(zone)}
                          className={`p-1.5 rounded-lg border transition ${
                            isLinked
                              ? "border-border text-muted-foreground/50 hover:text-destructive"
                              : "border-destructive/30 text-destructive hover:bg-destructive/10"
                          }`}
                          title={isLinked ? "Linked zones cannot be deleted (soft-disable instead)" : "Delete"}
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
