import Link from 'next/link';

import { UserMenu } from './user-menu';

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
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Signal UI Screens</h1>
        <UserMenu />
      </div>
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
