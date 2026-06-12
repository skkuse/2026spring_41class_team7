import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Jobclaw' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/" className="font-heading font-extrabold text-xl tracking-tight">
          Job<span className="text-primary">claw</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-heading text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: June 2026</p>

        <section className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">1. Acceptance</h2>
            <p>By using Jobclaw you agree to these Terms. If you do not agree, do not use the service.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">2. Use of the service</h2>
            <p>You may use Jobclaw to generate and publish technical profiles based on your own code contributions. You must not use the service to misrepresent others' work as your own.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">3. Your content</h2>
            <p>You retain ownership of your code and contributions. By publishing a profile, you grant Jobclaw a limited licence to display that profile on our platform.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">4. Accounts</h2>
            <p>You are responsible for keeping your account credentials secure. Notify us immediately at <a href="mailto:security@jobclaw.fyi" className="text-primary hover:underline">security@jobclaw.fyi</a> if you suspect unauthorised access.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">5. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">6. Disclaimer</h2>
            <p>Jobclaw is provided "as is" without warranty of any kind. We are not liable for any damages arising from your use of the service.</p>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-2">7. Contact</h2>
            <p>Questions? Email <a href="mailto:legal@jobclaw.fyi" className="text-primary hover:underline">legal@jobclaw.fyi</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
