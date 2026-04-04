import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';

const DASHBOARD_IMG =
  'https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/76524ixEd5g/components/d5XWfZC6Ix7.png';

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-20 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-9 bg-primary rounded flex items-center justify-center">
                <Icon icon="solar:bolt-bold" className="text-primary-foreground text-2xl" />
              </div>
              <span className="font-heading font-extrabold tracking-tight text-2xl">
                Job<span className="text-primary">Script</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <a href="#features" className="hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-primary transition-colors font-bold">
                Pricing
              </a>
              <a href="#templates" className="hover:text-primary transition-colors">
                Templates
              </a>
              <Link href="/documents" className="hover:text-primary transition-colors">
                Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="hidden sm:block text-[11px] font-mono font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/onboarding"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] inline-flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-chart-2/20 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Next-Gen Resume Engine Now Live
              </span>
            </div>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] md:leading-[1.08] mb-8">
              Code is your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-chart-1">
                Competitive Advantage.
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The AI portfolio builder that speaks developer. Connect your GitHub, and watch as we
              transform raw commits into a stunning, job-winning technical profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/onboarding"
                className="bg-foreground text-background px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-foreground/90 active:scale-95 transition-all text-lg group"
              >
                Build My Portfolio{' '}
                <Icon
                  icon="solar:arrow-right-bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/documents"
                className="bg-secondary text-secondary-foreground border border-border px-8 py-5 rounded-2xl font-bold hover:bg-muted active:scale-95 transition-all text-lg inline-flex items-center justify-center"
              >
                View Live Examples
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
            <div className="relative z-10 p-4 bg-linear-to-b from-border/50 to-transparent rounded-[2rem] border border-border/50 shadow-2xl backdrop-blur-sm">
              <Image
                alt="JobScript dashboard"
                src={DASHBOARD_IMG}
                width={1200}
                height={900}
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/5"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -top-10 -right-10 size-40 bg-primary/30 blur-3xl -z-10 animate-pulse" />
            <div
              style={{ animationDelay: '1s' }}
              className="absolute -bottom-10 -left-10 size-40 bg-chart-2/30 blur-3xl -z-10 animate-pulse"
            />
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-center text-muted-foreground mb-12">
            Empowering talent at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            <Icon icon="mdi:github" className="text-4xl" />
            <Icon icon="mdi:google" className="text-4xl" />
            <Icon icon="mdi:aws" className="text-4xl" />
            <Icon icon="mdi:netflix" className="text-4xl" />
            <Icon icon="mdi:microsoft" className="text-4xl" />
            <Icon icon="mdi:uber" className="text-4xl" />
            <Icon icon="mdi:spotify" className="text-4xl" />
          </div>
        </div>
      </section>
      <section id="features" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight mb-6 italic">
              Optimized for high-signal engineering teams.
            </h2>
            <p className="text-muted-foreground text-lg">
              We didn&apos;t just build a resume maker. We built a technical reputation engine that
              maps your true impact.
            </p>
          </div>
          <a
            href="#features"
            className="hidden md:flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all group"
          >
            Explore All Features <Icon icon="solar:arrow-right-linear" className="text-lg" />
          </a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-10 rounded-[2.5rem] group hover:border-primary/50 transition-colors">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Icon icon="solar:github-bold" className="text-primary text-3xl" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4">GitHub Deep-Sync</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our AI analyzes commit semantic meaning, code complexity, and contribution frequency
              to generate objective proof of skill.
            </p>
          </div>
          <div className="bg-card border border-border p-10 rounded-[2.5rem] group hover:border-chart-2/50 transition-colors">
            <div className="size-14 bg-chart-2/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Icon icon="solar:magic-stick-3-bold" className="text-chart-2 text-3xl" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4">Semantic Resume Writing</h3>
            <p className="text-muted-foreground leading-relaxed">
              No more writer&apos;s block. Our model transforms dry technical tasks into
              achievement-oriented bullet points that bypass ATS.
            </p>
          </div>
          <div id="templates" className="bg-card border border-border p-10 rounded-[2.5rem] group hover:border-chart-3/50 transition-colors scroll-mt-28">
            <div className="size-14 bg-chart-3/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Icon icon="solar:globus-bold" className="text-chart-3 text-3xl" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4">Headless Portfolio API</h3>
            <p className="text-muted-foreground leading-relaxed">
              Instantly host a SEO-optimized, blazing-fast web profile on your custom domain, or
              export to clean, developer-centric PDFs.
            </p>
          </div>
        </div>
      </section>
      <section className="py-32 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-10">
            <Icon icon="solar:star-bold" className="text-primary text-2xl" />
            <Icon icon="solar:star-bold" className="text-primary text-2xl" />
            <Icon icon="solar:star-bold" className="text-primary text-2xl" />
            <Icon icon="solar:star-bold" className="text-primary text-2xl" />
            <Icon icon="solar:star-bold" className="text-primary text-2xl" />
          </div>
          <blockquote className="font-heading text-3xl md:text-5xl font-extrabold italic tracking-tight leading-snug mb-12">
            &ldquo;I was dreading updating my portfolio for months. JobScript did it in 45 seconds
            using my GitHub history, and I landed 3 interviews the following week.&rdquo;
          </blockquote>
          <div className="flex flex-col items-center gap-4">
            <Image
              alt="Marcus Chen"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              width={64}
              height={64}
              className="size-16 rounded-full border-2 border-primary object-cover"
            />
            <div>
              <p className="text-lg font-bold">Marcus Chen</p>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Lead Engineer @ Vercel
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-32 px-6 lg:px-12 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold mb-24 tracking-tight">
            Engineered for simplicity.
          </h2>
          <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
            <div className="relative">
              <span className="font-mono text-[120px] font-black opacity-10 leading-none absolute -top-16 -left-4">
                01
              </span>
              <div className="relative z-10 pt-10">
                <h4 className="text-2xl font-bold mb-4">Authentication</h4>
                <p className="opacity-70 leading-relaxed">
                  Securely connect your GitHub profile. We read your public contributions and private
                  metadata (metadata only, we never touch your code).
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="font-mono text-[120px] font-black opacity-10 leading-none absolute -top-16 -left-4">
                02
              </span>
              <div className="relative z-10 pt-10">
                <h4 className="text-2xl font-bold mb-4">Neural Synthesis</h4>
                <p className="opacity-70 leading-relaxed">
                  Our engine builds a career knowledge graph, identifying your strongest languages,
                  most impactful projects, and growth trajectory.
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="font-mono text-[120px] font-black opacity-10 leading-none absolute -top-16 -left-4">
                03
              </span>
              <div className="relative z-10 pt-10">
                <h4 className="text-2xl font-bold mb-4">Multi-Channel Export</h4>
                <p className="opacity-70 leading-relaxed">
                  Deploy a stunning live URL, download an ATS-optimized PDF, or sync your profile
                  directly to LinkedIn and specialized job boards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center mb-24">
          <h2 className="font-heading text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            Invest in your trajectory.
          </h2>
          <p className="text-muted-foreground text-xl">
            One successful career move pays for a lifetime of JobScript Pro.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                <Icon icon="solar:check-circle-bold" className="text-primary text-xl shrink-0" />1
                AI Portfolio Generation
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
          <div className="bg-card border-2 border-primary p-12 rounded-[2.5rem] flex flex-col relative shadow-[0_0_40px_rgba(0,229,255,0.1)] md:scale-105">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="font-heading text-2xl font-bold mb-2">JobScript Pro</h3>
              <p className="text-muted-foreground text-sm">Total career reputation management.</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black">$12</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
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
        </div>
      </section>
      <section className="py-32 px-6 lg:px-12 text-center bg-primary text-primary-foreground relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-heading text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight italic">
            The future of hiring <br />
            is automated.
          </h2>
          <p className="mb-12 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Join 15,000+ top-tier developers who use JobScript to stay ahead of the curve. Your next
            role is 60 seconds away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="bg-background text-foreground px-12 py-5 rounded-2xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl inline-flex items-center justify-center"
            >
              Build My Portfolio Free
            </Link>
            <Link
              href="/documents"
              className="bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground px-12 py-5 rounded-2xl font-bold hover:bg-primary-foreground/20 transition-all text-xl inline-flex items-center justify-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>
      <footer className="py-24 px-6 lg:px-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="size-8 bg-primary rounded flex items-center justify-center">
                <Icon icon="solar:bolt-bold" className="text-primary-foreground text-xl" />
              </div>
              <span className="font-heading font-extrabold tracking-tight text-2xl">
                Job<span className="text-primary">Script</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
              Elevating developer reputation through high-signal AI analysis and professional
              presentation.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 bg-muted flex items-center justify-center rounded-lg hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Icon icon="mdi:github" className="text-xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 bg-muted flex items-center justify-center rounded-lg hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Icon icon="mdi:twitter" className="text-xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 bg-muted flex items-center justify-center rounded-lg hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Icon icon="mdi:linkedin" className="text-xl" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-foreground">
              Product
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-primary transition-colors">
                  Templates
                </a>
              </li>
              <li>
                <Link href="/home" className="hover:text-primary transition-colors">
                  AI Engine
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-foreground">
              Resources
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li>
                <Link href="/documents" className="hover:text-primary transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Changelog
                </a>
              </li>
              <li>
                <Link href="/documents" className="hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-foreground">
              Legal
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-foreground">
              Company
            </h5>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-muted-foreground/50 font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} JobScript. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
            <span>Status:</span>
            <span className="flex items-center gap-1.5 text-primary">
              <span className="size-1.5 bg-primary rounded-full animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
