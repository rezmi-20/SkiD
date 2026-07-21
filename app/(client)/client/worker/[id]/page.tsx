"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Briefcase, 
  MapPin, 
  Clock, 
  Award,
  AlertCircle,
  FileText
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

interface WorkerProfile {
  id: string;
  email: string;
  full_name: string;
  bio: string;
  skills: string[];
  latitude: number | null;
  longitude: number | null;
  hourly_rate: string;
  avatar_url: string;
  is_verified: boolean;
  avg_rating: string | number;
  total_ratings: string | number;
}

interface Review {
  score: number;
  comment: string;
  created_at: string;
  rater_email: string;
}

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/workers/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((d) => { setWorker(d.worker); setReviews(d.reviews || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const [messaging, setMessaging] = useState(false);

  const handleMessage = useCallback(async () => {
    if (messaging || !worker) return;
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/client/messages/${data.conversationId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMessaging(false);
    }
  }, [worker, messaging, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !worker) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 gap-6">
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive border border-destructive/20 shadow-sm">
        <AlertCircle size={28} />
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile Load Failed</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {error || "The worker profile could not be found or the database connection timed out."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
        <Button onClick={() => window.location.reload()} className="rounded-xl">Try Again</Button>
      </div>
      {error && (
        <Card className="mt-6 border-border bg-card w-full max-w-2xl overflow-auto rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Technical Details:</p>
            <code className="text-xs text-destructive font-mono">{error}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const primarySkill = Array.isArray(worker.skills) && worker.skills.length > 0 ? worker.skills[0] : "Professional";
  const rating = Number(worker.avg_rating);
  const initials = worker.full_name ? worker.full_name.slice(0, 2).toUpperCase() : "WP";

  const StarRow = ({ score, size = 14 }: { score: number; size?: number }) => (
    <span className="flex gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          className={i < Math.round(score) ? "fill-amber-500 stroke-none" : "fill-muted stroke-none"} 
        />
      ))}
    </span>
  );

  return (
    <FadeContent blur duration={0.4} className="space-y-6 pb-24">
      {/* ── TOP NAV / BREADCRUMB ── */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft size={18} />
        </Button>
        
        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/client/search" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <span className="capitalize">{primarySkill}s</span>
          <span>›</span>
          <span className="text-foreground font-semibold">{worker.full_name}</span>
        </nav>
        
        <h1 className="text-sm font-bold lg:hidden">Worker Profile</h1>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 size={18} />
        </Button>
      </div>

      {/* ════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
      ════════════════════════════════════════ */}
      <div className="lg:hidden space-y-4 pb-32">
        <div className="flex flex-col items-center text-center p-4 space-y-4">
          <Avatar className="w-24 h-24 rounded-full border-4 border-muted shadow-md">
            {worker.avatar_url && <AvatarImage src={worker.avatar_url} alt={worker.full_name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-muted-foreground font-bold text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">{worker.full_name}</h2>
              {worker.is_verified && (
                <ShieldCheck size={18} className="text-primary fill-primary/10" />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full">
                Senior {primarySkill}
              </Badge>
              {worker.is_verified && (
                <Badge variant="outline" className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-border">
                  <Award size={10} className="text-primary" />
                  Official Identity
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <Badge variant="secondary" className="flex items-center gap-0.5 bg-primary/10 text-primary border-none py-0 px-2 rounded-full font-bold">
                <Star size={10} className="fill-primary stroke-none" />
                <span>{rating.toFixed(1)}</span>
              </Badge>
              <span className="text-muted-foreground font-medium">({worker.total_ratings} reviews)</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground font-medium">1.2 km away</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <Card className="border-border bg-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold tracking-tight">About {worker.full_name.split(" ")[0]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {worker.bio || "Specializing in commercial and residential services. Safe, reliable, and prompt service in Dire Dawa. Fast repairs, solar installation, and maintenance."}
            </p>
            <Separator className="bg-border" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Experience</span>
                <p className="font-bold text-foreground">15+ Years</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">COC Verification</span>
                <p className="font-bold text-primary flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="border-border bg-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold tracking-tight">Skills & Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {(worker.skills?.length > 0 ? worker.skills : ["Pipe Installation", "Leak Repair", "Solar Installation", "House Wiring", "Generator Set Maintenance", "CCTV Installation", "General Repairs"]).map((s, i) => (
                <Badge key={i} variant="outline" className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-border bg-muted/30">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border-border bg-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold tracking-tight">Reviews & Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center shrink-0 space-y-1">
                <span className="text-2xl font-black">{rating.toFixed(1)}</span>
                <StarRow score={rating} size={12} />
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Summary</span>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-bold w-2">{s}</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: s === 5 ? "75%" : s === 4 ? "18%" : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((rev, i) => (
                <div key={i} className="space-y-2 pb-4 border-b border-border last:border-none last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border shadow-inner">
                        <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                          {rev.rater_email?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{rev.rater_email?.split("@")[0] || "User"}</span>
                          <Badge variant="secondary" className="flex items-center gap-0.5 bg-primary/10 text-primary border-none py-0 px-1.5 rounded-full font-bold text-[9px]">
                            <Star size={8} className="fill-primary stroke-none" />
                            <span>{rev.score}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {new Date(rev.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-9">{rev.comment}</p>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground text-center py-4 italic">No reviews yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── MOBILE STICKY BOTTOM ACTIONS ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex gap-3">
          <Button onClick={handleMessage} disabled={messaging} variant="outline" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-wider text-xs">
            {messaging ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <MessageSquare size={16} className="mr-1.5" />
            )}
            Message
          </Button>
          <Button asChild className="flex-1 rounded-xl h-12 font-bold uppercase tracking-wider text-xs shadow-md shadow-primary/10" variant="default">
            <Link href={`/client/contract/new?workerId=${worker.id}`}>
              <FileText size={16} className="mr-1.5" />
              Start Hiring
            </Link>
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg)
      ════════════════════════════════════════ */}
      <div className="hidden lg:block max-w-7xl mx-auto py-4">
        <div className="grid grid-cols-3 gap-6">

          {/* Left Panel: Hero card */}
          <Card className="col-span-1 border border-border bg-card shadow-sm rounded-2xl overflow-hidden self-start sticky top-20">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-6">
              <Avatar className="w-28 h-28 border-4 border-muted shadow-md">
                {worker.avatar_url && <AvatarImage src={worker.avatar_url} alt={worker.full_name} className="object-cover" />}
                <AvatarFallback className="bg-muted text-muted-foreground font-bold text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{worker.full_name}</h2>
                  {worker.is_verified && (
                    <ShieldCheck size={18} className="text-primary fill-primary/10" />
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full">
                    Senior {primarySkill}
                  </Badge>
                  {worker.is_verified && (
                    <Badge variant="outline" className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-border">
                      <Award size={10} className="text-primary" />
                      Official Identity
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs pt-1">
                  <Badge variant="secondary" className="flex items-center gap-0.5 bg-primary/10 text-primary border-none py-0 px-2 rounded-full font-bold">
                    <Star size={10} className="fill-primary stroke-none" />
                    <span>{rating.toFixed(1)}</span>
                  </Badge>
                  <span className="text-muted-foreground">({worker.total_ratings} reviews)</span>
                </div>
                
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin size={12} className="text-muted-foreground/60" />
                  <span>1.2 km away • Dire Dawa</span>
                </p>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <Button onClick={handleMessage} disabled={messaging} variant="outline" className="flex-1 rounded-xl h-11 font-bold uppercase tracking-wider text-xs">
                  {messaging ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageSquare size={14} className="mr-1.5" />
                  )}
                  Message
                </Button>
                <Button asChild className="flex-1 rounded-xl h-11 font-bold uppercase tracking-wider text-xs shadow-md shadow-primary/10" variant="default">
                  <Link href={`/client/contract/new?workerId=${worker.id}`}>
                    <FileText size={14} className="mr-1.5" />
                    Start Hiring
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Middle Panel: About + Skills */}
          <div className="col-span-1 space-y-4">
            {/* About Card */}
            <Card className="border border-border bg-card shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold tracking-tight">About {worker.full_name.split(" ")[0]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {worker.bio || "Specializing in commercial and residential services. Safe, reliable, and prompt service in Dire Dawa. Fast repairs, solar installation, and maintenance."}
                </p>
                <Separator className="bg-border" />
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground font-medium">Years of Experience</span>
                    <p className="font-bold text-foreground">15+ Years</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground font-medium">COC Certificate</span>
                    <p className="font-bold text-primary flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialization Card */}
            <Card className="border border-border bg-card shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold tracking-tight">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(worker.skills?.length > 0 ? worker.skills : ["Pipe Installation", "Leak Repair", "Solar Installation", "House Wiring", "Generator Set Maintenance", "Fault Finding", "CCTV Installation", "General Repairs"]).map((s, i) => (
                    <Badge key={i} variant="outline" className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-border bg-muted/30">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Reviews */}
          <Card className="col-span-1 border border-border bg-card shadow-sm rounded-2xl self-start">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold tracking-tight">Client Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-center shrink-0 space-y-1">
                  <span className="text-2xl font-black">{rating.toFixed(1)}</span>
                  <StarRow score={rating} size={11} />
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Summary</span>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-bold w-2">{s}</span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: s === 5 ? "75%" : s === 4 ? "18%" : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((rev, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b border-border last:border-none last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-border shadow-inner">
                          <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                            {rev.rater_email?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">{rev.rater_email?.split("@")[0]}</span>
                            <Badge variant="secondary" className="flex items-center gap-0.5 bg-primary/10 text-primary border-none py-0 px-1.5 rounded-full font-bold text-[9px]">
                              <Star size={8} className="fill-primary stroke-none" />
                              <span>{rev.score}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        {new Date(rev.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-9">{rev.comment}</p>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">No reviews yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </FadeContent>
  );
}
