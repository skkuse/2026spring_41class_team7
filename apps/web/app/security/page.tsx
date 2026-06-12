import Link from 'next/link';

export const metadata = { title: 'Security — Jobclaw' };

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/" className="font-heading font-extrabold text-xl tracking-tight">
          Job<span className="text-primary">claw</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-heading text-4xl font-bold mb-4">Security</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: June 2026</p>

        <section className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Reporting a vulnerability</h2>
            <p>If you discover a security vulnerability in Jobclaw, please disclose it responsibly by emailing <a href="mailto:security@jobclaw.fyi" className="text-primary hover:underline">security@jobclaw.fyi</a>. We will respond within 48 hours and aim to patch confirmed issues within 7 days.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">API key handling</h2>
            <p>OpenAI API keys are stored locally on your machine at <code className="text-primary">~/.jobclaw/secrets.json</code> with file permissions set to 600. They are never sent to Jobclaw servers.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Authentication</h2>
            <p>User sessions are managed via Supabase Auth with short-lived JWTs. We recommend enabling two-factor authentication on your linked GitHub account.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Data in transit</h2>
            <p>All communication between the Jobclaw CLI, API, and web app is encrypted via TLS 1.2+.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
