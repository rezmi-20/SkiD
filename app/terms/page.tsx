import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2, Scale, Lock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DireSkill",
  description: "Terms and conditions governing the use of DireSkill skilled informal labor marketplace in Dire Dawa, Ethiopia.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-200 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d0f14]/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to DireSkill</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
            <span className="text-emerald-400 font-semibold">Terms</span>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Framework &bull; Ethiopian Labour Proclamation 1156/2019</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Please read these terms carefully before utilizing DireSkill. By accessing or registering on DireSkill, you agree to comply with and be bound by the conditions established below.
          </p>
          <div className="text-xs text-zinc-500 pt-2 flex items-center gap-3">
            <span>Effective Date: October 2026</span>
            <span>&bull;</span>
            <span>Dire Dawa University Capstone Implementation</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 leading-relaxed text-sm text-zinc-300">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">1</span>
            Acceptance & Institutional Context
          </h2>
          <p>
            DireSkill is a specialized digital marketplace developed as a high-integrity final year capstone project at <strong className="text-white">Dire Dawa University</strong>. The platform connects skilled informal workers (electricians, plumbers, carpenters, masonry artisans, and mechanics) with verified household and business clients in the Dire Dawa Administration, Ethiopia.
          </p>
          <p>
            By creating an account, browsing service listings, or initiating work agreements, you confirm that you are at least 18 years old, possess legal capacity to enter contracts under Ethiopian law, and accept all clauses in these Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">2</span>
            User Accounts & Registration Integrity
          </h2>
          <p>
            Users may register either as a <strong className="text-white">Client</strong> or as a <strong className="text-white">Skilled Worker</strong>. You must provide truthful, current, and complete information during registration.
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li><strong className="text-zinc-200">Email & Phone Verification:</strong> All accounts require multi-factor verification via One-Time Passwords (OTP) delivered to active contact addresses.</li>
            <li><strong className="text-zinc-200">Account Confidentiality:</strong> You are strictly responsible for maintaining credential confidentiality and all activities originating from your account.</li>
            <li><strong className="text-zinc-200">Single Identity Rule:</strong> Users may not create duplicate accounts to evade suspensions or manipulate ratings.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">3</span>
            Artisan Verification & National ID Standards
          </h2>
          <p>
            To protect household security in Dire Dawa, all artisans seeking active job placement undergo verification:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>National ID (Fayda / Kebele) Validation</span>
            </div>
            <p className="text-zinc-400">
              Artisans submit government identification and trade certifications. Fayda Identification Numbers (FIN) are encrypted using AES-256 at rest, and verification officers verify physical credentials prior to conferring the verified artisan badge.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">4</span>
            Legally Binding Digital Contracts
          </h2>
          <p>
            When a client hires an artisan through DireSkill, the platform automatically generates an enforceable digital contract compliant with <strong className="text-white">Ethiopian Labour Proclamation No. 1156/2019</strong> and the <strong className="text-white">Electronic Transaction Proclamation No. 1205/2020</strong>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>Both parties must review and apply cryptographic digital signatures confirming agreed milestones, deadlines, material responsibilities, and total contract amounts in Ethiopian Birr (ETB).</li>
            <li>Each completed agreement produces a permanent SHA-256 cryptographic document hash and verifiable QR code for court evidence admissibility.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">5</span>
            Payments, Escrow & Milestone Releases
          </h2>
          <p>
            Payments on DireSkill are conducted securely via licensed Ethiopian payment gateway partners, including <strong className="text-white">Chapa Financial Technologies</strong> and mobile money providers (Telebirr, CBE Birr).
          </p>
          <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Escrow Protection Principle</span>
            </div>
            <p className="text-zinc-400">
              Client funds are held in escrow until work is inspected and accepted. Once a milestone is approved by the client, funds are split and disbursed directly to the artisan's registered bank or mobile wallet, less the platform service fee.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">6</span>
            Dispute Resolution & Fair Arbitration
          </h2>
          <p>
            If a dispute arises regarding workmanship quality, incomplete tasks, or payment delays:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>Either party may open an official dispute within 72 hours of completion submission.</li>
            <li>Disputed funds are automatically placed on a financial freeze, preventing unauthorized release.</li>
            <li>Authorized DireSkill dispute arbitrators inspect submitted photographic evidence, contract terms, and in-app chat histories to issue a fair decision or order rework.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">7</span>
            Prohibited Conduct & Anti-Circumvention
          </h2>
          <p>
            Users agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li>Circumvent platform escrow or solicit off-platform cash payments for jobs initiated via DireSkill.</li>
            <li>Submit fraudulent identification, forged licenses, or falsified national ID documents.</li>
            <li>Harass, intimidate, or discriminate against any worker or client based on gender, ethnicity, or religion.</li>
            <li>Upload malicious code, scrape user directory data, or tamper with system audit trails.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">8</span>
            Contact & Academic Oversight
          </h2>
          <p>
            For legal inquiries, dispute consultations, or institutional feedback regarding DireSkill:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1 text-zinc-400">
            <p><strong className="text-white">Institution:</strong> Dire Dawa University, Department of Software Engineering / Information Technology</p>
            <p><strong className="text-white">Project:</strong> DireSkill Skilled Informal Labor Marketplace</p>
            <p><strong className="text-white">Email:</strong> support@direskill.com &bull; legal@direskill.com</p>
            <p><strong className="text-white">Location:</strong> Dire Dawa, Ethiopia</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-zinc-500">
        <p>&copy; 2026 DireSkill. All rights reserved. Compliant with Ethiopian Labour Proclamation 1156/2019.</p>
      </footer>
    </div>
  );
}
