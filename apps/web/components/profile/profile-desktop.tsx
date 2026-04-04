import { invoices, profile, stats } from '../../lib/mock-data';

const cards = [
  ['Total Views', stats.views, '+12%'],
  ['Unique Guests', stats.uniqueGuests, '+8%'],
  ['Avg Session', stats.avgSession, '-4%'],
  ['PDF DLs', stats.pdfDownloads, '+24%'],
] as const;

export function ProfileDesktop() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <h1 className="mb-8 text-4xl font-bold">Account Control</h1>
      <section className="mb-8 rounded border border-border bg-card/40 p-6">
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-muted-foreground">
          {profile.role} / {profile.email}
        </p>
      </section>
      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(([name, value, delta]) => (
          <div key={name} className="rounded border border-border bg-card/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">{name}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-cyan-300">{delta}</p>
          </div>
        ))}
      </section>
      <section className="rounded border border-border bg-card/20 p-6">
        <h3 className="mb-3 text-lg font-semibold">Invoices</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex justify-between rounded border border-border p-3">
              <span>{inv.id}</span>
              <span className="text-muted-foreground">
                {inv.date} · {inv.amount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
