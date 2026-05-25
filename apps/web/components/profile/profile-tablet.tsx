import type { ProfileData } from './responsive-profile';

export function ProfileTablet({ data }: { data: ProfileData }) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl border-x border-border px-8 py-10 pb-nav-safe">
      <h1 className="mb-2 font-home-heading text-2xl font-bold uppercase tracking-tight">
        Identity
      </h1>
      <p className="mb-8 font-home-mono text-sm text-muted-foreground">Public profile · v1.0</p>
      <div className="mb-10 flex flex-col gap-8 sm:flex-row sm:items-center">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="mx-auto h-28 w-28 shrink-0 rounded-full border-2 border-primary object-cover sm:mx-0"
          />
        ) : (
          <div className="mx-auto h-28 w-28 shrink-0 rounded-full border-2 border-primary sm:mx-0" />
        )}
        <div className="text-center sm:text-left">
          <h2 className="font-home-heading text-3xl font-black">{data.name || '—'}</h2>
          <p className="mt-1 font-home-mono text-xs uppercase text-muted-foreground">
            {data.email || '—'}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex justify-between rounded-lg border border-border bg-card/40 p-5">
          <span className="font-home-mono text-[10px] font-bold uppercase text-muted-foreground">
            Assessments
          </span>
          <strong className="text-lg">{data.assessmentCount}</strong>
        </div>
      </div>
    </main>
  );
}
