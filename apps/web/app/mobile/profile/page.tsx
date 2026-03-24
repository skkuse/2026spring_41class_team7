
import { profile, stats } from '../../../lib/mock-data';

export default function MobileProfilePage() {
  return (
    <main className="min-h-screen max-w-md mx-auto border-x border-border p-5 pb-24">
      <h1 className="text-xl font-bold mb-6">Identity_v1.0</h1>
      <section className="text-center mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-cyan-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black">{profile.name}</h2>
        <p className="text-xs text-muted-foreground uppercase">{profile.email}</p>
      </section>
      <section className="space-y-3">
        <div className="p-4 rounded border border-border bg-card flex justify-between"><span>Active Projects</span><strong>14</strong></div>
        <div className="p-4 rounded border border-border bg-card flex justify-between"><span>Portfolio Views</span><strong>{stats.views}</strong></div>
      </section>
    </main>
  );
}
