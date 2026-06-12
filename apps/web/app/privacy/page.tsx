import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Jobclaw' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/" className="font-heading font-extrabold text-xl tracking-tight">
          Job<span className="text-primary">claw</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-heading text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: June 2026</p>

        <section className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">1. What we collect</h2>
            <p>When you use Jobclaw, we collect your email address and GitHub profile metadata (public repositories, contribution history) to generate your technical profile. We do not read private repository code.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">2. How we use it</h2>
            <p>Your data is used solely to generate and display your Jobclaw profile. We do not sell or share your personal information with third parties for advertising purposes.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">3. API keys</h2>
            <p>OpenAI API keys entered via the CLI are stored locally in <code className="text-primary">~/.jobclaw/secrets.json</code> (mode 600) and are never transmitted to Jobclaw servers.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">4. Data retention</h2>
            <p>You may delete your account and all associated data at any time by contacting us at <a href="mailto:privacy@jobclaw.fyi" className="text-primary hover:underline">privacy@jobclaw.fyi</a>.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">5. Contact</h2>
            <p>Questions? Email us at <a href="mailto:privacy@jobclaw.fyi" className="text-primary hover:underline">privacy@jobclaw.fyi</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
