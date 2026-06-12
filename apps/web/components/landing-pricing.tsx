'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState } from 'react';

export function LandingPricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
          For developers. For hiring teams.
        </h2>
        <p className="text-muted-foreground text-xl mb-10">
          One platform that fixes hiring from both ends.
        </p>
        <div className="inline-flex items-center gap-1 bg-muted/50 border border-border p-1 rounded-full">
          <button
            onClick={() => setYearly(false)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              !yearly
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              yearly
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-black">
              Save 31%
            </span>
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Individual */}
        <div className="bg-card border border-border p-12 rounded-[2.5rem] flex flex-col">
          <div className="mb-8">
            <h3 className="font-heading text-2xl font-bold mb-2">Individual</h3>
            <p className="text-muted-foreground text-sm">Perfect for your next job search.</p>
          </div>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-black">$0</span>
            <span className="text-muted-foreground">/ forever</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 opacity-80">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              1 AI Portfolio Generation
            </li>
            <li className="flex items-center gap-3 opacity-80">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              Standard PDF Export
            </li>
            <li className="flex items-center gap-3 opacity-80">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              Public Profile URL
            </li>
            <li className="flex items-center gap-3 opacity-40 italic">
              <Icon icon="solar:close-circle-bold" className="text-xl shrink-0" />
              Custom Domain
            </li>
          </ul>
          <Link
            href="/onboarding"
            className="w-full bg-secondary text-secondary-foreground py-5 rounded-2xl font-bold hover:bg-muted transition-all text-center"
          >
            Get Started Free
          </Link>
        </div>

        {/* Developer Pro */}
        <div className="bg-card border-2 border-primary p-12 rounded-[2.5rem] flex flex-col relative shadow-[0_0_40px_rgba(217,119,87,0.1)]">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
            Most Popular
          </div>
          <div className="mb-8">
            <h3 className="font-heading text-2xl font-bold mb-2">Developer Pro</h3>
            <p className="text-muted-foreground text-sm">Total career reputation management.</p>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-black">
              {yearly ? '$99' : '$12'}
            </span>
            <span className="text-muted-foreground">
              {yearly ? '/ year' : '/ month'}
            </span>
          </div>
          {yearly && (
            <p className="text-xs text-primary font-mono font-bold mb-8">
              $8.25 / month — save $45 vs monthly
            </p>
          )}
          {!yearly && <div className="mb-8" />}
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              <strong>Unlimited</strong> AI Generations
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              Advanced GitHub Analytics Sync
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              Custom Domain + SSL
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />
              Premium Developer Templates
            </li>
          </ul>
          <Link
            href="/billing"
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 text-center"
          >
            Go Pro Now
          </Link>
        </div>

        {/* Company */}
        <div className="bg-foreground text-background p-12 rounded-[2.5rem] flex flex-col relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-chart-2 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
            For Hiring Teams
          </div>
          <div className="mb-8">
            <h3 className="font-heading text-2xl font-bold mb-2">Company</h3>
            <p className="opacity-60 text-sm">Find developers whose code fits your codebase.</p>
          </div>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-black">Custom</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-chart-2 text-xl shrink-0" />
              Browse verified developer profiles
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-chart-2 text-xl shrink-0" />
              Codebase-fit scoring per candidate
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-chart-2 text-xl shrink-0" />
              Private assessments for applicants
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-chart-2 text-xl shrink-0" />
              Company account + team access
            </li>
            <li className="flex items-center gap-3">
              <Icon icon="solar:check-circle-bold" className="text-chart-2 text-xl shrink-0" />
              Custom evaluators for your stack
            </li>
          </ul>
          <a
            href="mailto:contact@digitalnative.vip"
            className="w-full bg-background text-foreground py-5 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all text-center"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
