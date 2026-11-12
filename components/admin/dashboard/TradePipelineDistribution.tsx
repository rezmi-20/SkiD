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
}

export function TradePipelineDistribution({
  stages,
  totalActiveVolume = "ETB 2,500",
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
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">Skilled Trades Distribution</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Real artisan registrations across Dire Dawa</p>
        </div>

        <div className="space-y-5">
          {items.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stage.count} pro{stage.count === 1 ? '' : 's'}</span>
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
            </div>
          ))}
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
