"use client";

import { useState, useEffect } from "react";

export interface TradeStageItem {
  name: string;
  value: number;
  count: number;
  color: string;
}

const defaultStages: TradeStageItem[] = [
  { name: "Satellite Dish Installer", value: 34, count: 1, color: "bg-chart-1" },
  { name: "House Finishing", value: 33, count: 1, color: "bg-chart-2" },
  { name: "Painter", value: 33, count: 1, color: "bg-chart-3" },
];

interface TradePipelineDistributionProps {
  stages?: TradeStageItem[];
  totalActiveVolume?: string;
  selectedTrade?: string;
  onSelectTrade?: (tradeName: string) => void;
}

export function TradePipelineDistribution({
  stages,
  totalActiveVolume = "ETB 2,500",
  selectedTrade = "All",
  onSelectTrade,
}: TradePipelineDistributionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const items = stages && stages.length > 0 ? stages : defaultStages;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-[380px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 flex flex-col justify-between">
      <div>
        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">Skilled Trades Distribution</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {onSelectTrade ? "Click a trade to filter the verification queue below" : "Real artisan registrations across Dire Dawa"}
            </p>
          </div>
          {onSelectTrade && selectedTrade !== "All" && (
            <button
              type="button"
              onClick={() => onSelectTrade("All")}
              className="text-xs font-semibold text-accent hover:underline shrink-0"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="space-y-4">
          {items.map((stage, index) => {
            const isSelected = selectedTrade !== "All" && stage.name.toLowerCase() === selectedTrade.toLowerCase();
            return (
              <button
                key={stage.name}
                type="button"
                onClick={() => onSelectTrade?.(isSelected ? "All" : stage.name)}
                className={`w-full text-left space-y-2 rounded-lg p-1.5 -mx-1.5 transition ${
                  onSelectTrade ? "hover:bg-secondary/60 cursor-pointer" : ""
                } ${isSelected ? "bg-secondary ring-1 ring-accent/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{stage.name}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-sm text-muted-foreground">{stage.count} pro{stage.count === 1 ? "" : "s"}</span>
                    <span className="text-sm font-semibold text-foreground">{stage.value}%</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: isLoaded ? `${stage.value}%` : "0%",
                      transitionDelay: `${index * 150}ms`,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total pipeline value */}
      <div className="pt-5 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Contracts Value</span>
          <span className="text-xl font-bold text-foreground">{totalActiveVolume}</span>
        </div>
      </div>
    </div>
  );
}
