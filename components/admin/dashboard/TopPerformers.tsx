"use client";

import { Trophy, TrendingUp } from "lucide-react";

export interface PerformerItem {
  id: string;
  name: string;
  specialty: string;
  contracts: number;
  revenue: string;
  rating?: string;
  change: string;
  rank: number;
  avatar_url?: string | null;
}

const defaultPerformers: PerformerItem[] = [
  { id: "1", name: "Remzi manual test", specialty: "House Finishing", contracts: 1, revenue: "ETB 1,000", rating: "5.0 ★", change: "100%", rank: 1 },
  { id: "2", name: "Remedan seid", specialty: "Painter & Satellite", contracts: 1, revenue: "ETB 1,000", rating: "5.0 ★", change: "100%", rank: 2 },
];

interface TopPerformersProps {
  performers?: PerformerItem[];
}

export function TopPerformers({ performers }: TopPerformersProps) {
  const items = performers && performers.length > 0 ? performers : defaultPerformers;

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Top Performing Artisans</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Real verified artisan leaders in Dire Dawa</p>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((person, index) => (
          <div
            key={person.id || person.name}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-right-2"
            style={{ animationDelay: `${(index + 4) * 100}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-sm font-semibold text-accent-foreground overflow-hidden">
                  {person.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={person.avatar_url} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    person.name.split(" ").map((n) => n[0]).join("")
                  )}
                </div>
                {person.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-background shadow-xs">
                    {person.rank}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{person.name}</p>
                <p className="text-xs text-muted-foreground">
                  {person.contracts} job{person.contracts === 1 ? '' : 's'} • {person.specialty}
                  {person.rating && ` • ${person.rating}`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground tabular-nums">{person.revenue}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-success font-medium">
                <TrendingUp className="w-3 h-3" />
                {person.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

