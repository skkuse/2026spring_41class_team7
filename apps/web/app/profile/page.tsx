
import { invoices, profile, stats } from '../../lib/mock-data';

const cards = [
  ['Total Views', stats.views, '+12%'],
  ['Unique Guests', stats.uniqueGuests, '+8%'],
  ['Avg Session', stats.avgSession, '-4%'],
  ['PDF DLs', stats.pdfDownloads, '+24%'],
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-8">Account Control</h1>
      <section className="border border-border bg-card/40 rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-muted-foreground">{profile.role} / {profile.email}</p>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(([name, value, delta]) => (
          <div key={name as string} className="border border-border rounded p-4 bg-card/20">
            <p className="text-xs text-muted-foreground uppercase">{name}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-cyan-300">{delta}</p>
          </div>
        ))}
      </section>
      <section className="border border-border rounded p-6 bg-card/20">
        <h3 className="text-lg font-semibold mb-3">Invoices</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-3 border border-border rounded flex justify-between">
              <span>{inv.id}</span>
              <span className="text-muted-foreground">{inv.date} · {inv.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
