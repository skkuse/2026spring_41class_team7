import Link from 'next/link';

import { UserMenu } from '../user-menu';

const routes = [
  '/',
  '/landing',
  '/home',
  '/onboarding',
  '/builder',
  '/preview',
  '/documents',
  '/profile',
  '/settings',
  '/billing',
  '/mobile/builder',
];

export default function DevHubPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">JobScript UI Screens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketing entry <Link href="/">/</Link> · app dashboard{' '}
            <Link href="/home">/home</Link>.
          </p>
        </div>
        <UserMenu />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {routes.map((route) => (
          <Link
            key={route}
            href={route}
            className="rounded border border-border bg-card px-4 py-3 hover:border-primary"
          >
            {route}
          </Link>
        ))}
      </div>
    </main>
  );
}
