import { profile, stats } from '../../lib/mock-data';

export function ProfileMobile() {
  return (
    <main className="mx-auto min-h-screen max-w-md border-x border-border p-5 pb-nav-safe">
      <h1 className="mb-6 text-xl font-bold">Identity_v1.0</h1>
      <section className="mb-8 text-center">
        <div className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-cyan-400" />
        <h2 className="text-3xl font-black">{profile.name}</h2>
        <p className="text-xs uppercase text-muted-foreground">{profile.email}</p>
      </section>
      <section className="space-y-3">
        <div className="flex justify-between rounded border border-border bg-card p-4">
          <span>Active Projects</span>
          <strong>14</strong>
        </div>
        <div className="flex justify-between rounded border border-border bg-card p-4">
          <span>Portfolio Views</span>
          <strong>{stats.views}</strong>
        </div>
      </section>
    </main>
  );
}
