
import Link from 'next/link';

const routes = [
  '/landing',
  '/onboarding',
  '/documents',
  '/profile',
  '/settings',
  '/billing',
  '/mobile/home',
  '/mobile/builder',
  '/mobile/preview',
  '/mobile/profile',
  '/mobile/settings',
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Signal UI Screens</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {routes.map((route) => (
          <Link key={route} href={route} className="rounded border border-border bg-card px-4 py-3 hover:border-cyan-400">
            {route}
          </Link>
        ))}
      </div>
    </main>
  );
}
