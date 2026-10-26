import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, EyeOff, Server, FileCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DireSkill",
  description: "Privacy policy detailing data protection, Fayda national ID encryption, and contact masking on DireSkill.",
};

export default function PrivacyPage() {
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
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">Privacy</span>
            <span>&bull;</span>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection &bull; AES-256 Encryption Standard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Your privacy and security are foundational to DireSkill. This policy outlines how we collect, safeguard, and responsibly process personal information in Dire Dawa, Ethiopia.
          </p>
          <div className="text-xs text-zinc-500 pt-2 flex items-center gap-3">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span>Version 2.4</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 leading-relaxed text-sm text-zinc-300">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">1</span>
            Data We Collect
          </h2>
          <p>
            To deliver verified marketplace connections, DireSkill collects only necessary information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-emerald-400">Account & Profile</h3>
              <p className="text-xs text-zinc-400">Full name, verified email address, phone number, trade category, hourly rates, district location in Dire Dawa, and profile pictures.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-emerald-400">Identity & Verification</h3>
              <p className="text-xs text-zinc-400">National ID documents (Fayda / Kebele card), trade competency certificates, and facial verification selfies for fraud prevention.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-emerald-400">Contracts & Evidence</h3>
              <p className="text-xs text-zinc-400">Cryptographically signed digital contract terms, completion photos, dispute filings, and ratings submitted by clients.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-emerald-400">Technical & Security Logs</h3>
              <p className="text-xs text-zinc-400">Authentication timestamps, IP addresses, immutable audit logs for administrative actions, and session cookies.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">2</span>
            Fayda National ID & FIN Cryptographic Protection
          </h2>
          <p>
            National Identity numbers (FIN) are sensitive governmental identifiers. DireSkill implements rigorous security controls:
          </p>
          <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Lock className="w-4 h-4" />
              <span>AES-256 Encryption at Rest</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Full national ID numbers are encrypted in PostgreSQL using military-grade AES-256 encryption. Only the last 4 digits are rendered in administrative interfaces, and access to raw identification data is restricted to authorized verification staff with every query captured in an append-only audit trail.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">3</span>
            In-App Communication & Anti-Harassment Privacy
          </h2>
          <p>
            To protect users from external harassment, stalking, and predatory off-platform solicitations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li><strong className="text-zinc-200">Contact Number Masking:</strong> In-app messaging automatically masks phone numbers, personal social handles, and payment credentials prior to contract execution.</li>
            <li><strong className="text-zinc-200">Private Media Uploads:</strong> Chat images, dispute attachments, and support evidence are stored behind authenticated streaming proxies, ensuring that files cannot be accessed via public web links by unauthorized third parties.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">4</span>
            Financial Privacy & Payment Processing
          </h2>
          <p>
            DireSkill does not store credit card numbers or banking PINs on its servers. All payment flows are processed directly through <strong className="text-white">Chapa Financial Technologies</strong> and official Ethiopian mobile money endpoints compliant with PCI-DSS data security standards.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">5</span>
            Data Retention & Deletion Rights
          </h2>
          <p>
            You have the right to request access to, correction of, or permanent deletion of your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
            <li><strong className="text-zinc-200">Account Erasure:</strong> Clients and workers may submit an account closure request through support. Personal profiles, active listings, and unneeded attachments will be expunged.</li>
            <li><strong className="text-zinc-200">Statutory Recordkeeping:</strong> Financial invoices and signed contracts are retained for the statutory period mandated by Ethiopian tax and commercial laws before destruction.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-emerald-400 font-mono">6</span>
            Data Protection Inquiries
          </h2>
          <p>
            For privacy inquiries, data subject access requests, or security vulnerability disclosures:
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1 text-zinc-400">
            <p><strong className="text-white">Data Protection Officer:</strong> DireSkill Project Team &bull; Dire Dawa University</p>
            <p><strong className="text-white">Email:</strong> privacy@direskill.com &bull; security@direskill.com</p>
            <p><strong className="text-white">Address:</strong> Dire Dawa University Campus, Dire Dawa, Ethiopia</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-zinc-500">
        <p>&copy; 2026 DireSkill. All rights reserved. Built with AES-256 data protection.</p>
      </footer>
    </div>
  );
}
