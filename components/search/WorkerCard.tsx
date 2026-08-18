"use client";

import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, ShieldCheck, ArrowRight, MapPin, BadgeDollarSign, Wrench } from "lucide-react";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { t } = useLanguage();
  const initials = worker.name ? worker.name.slice(0, 2).toUpperCase() : "WP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all rounded-xl overflow-hidden group">
        <CardContent className="p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            
            {/* Header info with Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar className="w-12 h-12 border border-border shadow-sm group-hover:scale-105 duration-300 transition-transform">
                  {worker.photo && <AvatarImage src={worker.photo} alt={worker.name} className="object-cover" />}
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {worker.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full border border-card p-0.5 shadow flex items-center justify-center" title={t("search.verifiedProfessional")}>
                    <ShieldCheck size={12} className="stroke-[2.5]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {worker.name}
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("search.verifiedContractor")}
                </p>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 py-0.5 px-2 rounded-full font-bold">
                <Star size={11} className="fill-primary stroke-none" />
                <span className="text-[10px]">{worker.rating.toFixed(1)}</span>
              </Badge>
            </div>

            <Separator className="bg-border/60" />

            {/* Key-Value Details list vibe */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5"><Wrench size={13} /> {t("search.specialization")}</span>
                <span className="font-semibold text-foreground text-right">{worker.skill}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5"><MapPin size={13} /> {t("search.distanceLabel")}</span>
                <span className="font-semibold text-foreground text-right">
                  {worker.distance === "N/A" ? t("search.locationUnavailable") : t("search.kmAway").replace("{distance}", String(worker.distance))}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5"><BadgeDollarSign size={13} /> {t("search.hourlyRate")}</span>
                <span className="font-bold text-foreground text-right">{t("search.standardDynamic")}</span>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Skills Badges */}
            <div className="flex flex-wrap items-center gap-1">
              {worker.skills?.slice(0, 4).map((skill) => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-border bg-muted/40 rounded-md"
                >
                  {skill}
                </Badge>
              ))}
            </div>

          </div>

          {/* Action Button Row */}
          <div className="pt-4 flex justify-end">
            <Button asChild size="sm" className="w-full sm:w-auto rounded-xl font-bold uppercase tracking-wider text-[10px] h-9 shadow-sm" variant="outline">
              <Link href={`/client/worker/${worker.id}`} className="flex items-center justify-center gap-1.5">
                <span>{t("worker.viewProfile")}</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
