import type { ProfileData } from './responsive-profile';

export function ProfileDesktop({ data }: { data: ProfileData }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6 md:p-10">
      <h1 className="mb-8 text-4xl font-bold">Account Control</h1>
      <section className="mb-8 rounded border border-border bg-card/40 p-6">
        <h2 className="text-2xl font-semibold">{data.name || '—'}</h2>
        <p className="text-muted-foreground">{data.email || '—'}</p>
      </section>
      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded border border-border bg-card/20 p-4">
          <p className="text-xs uppercase text-muted-foreground">Assessments</p>
          <p className="text-2xl font-bold">{data.assessmentCount}</p>
          <p className="text-xs text-cyan-300">published</p>
        </div>
      </section>
    </main>
  );
}
