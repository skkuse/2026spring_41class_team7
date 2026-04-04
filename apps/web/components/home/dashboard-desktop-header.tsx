'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserMenu } from '../../app/user-menu';
import { dashboardNavItems } from './dashboard-nav-items';

export function DashboardDesktopHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-6 px-6 lg:px-8">
        <Link
          href="/home"
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px_rgba(0,229,255,0.15)]">
            <Icon icon="hugeicons:code" className="text-xl" />
          </div>
          <span className="font-home-heading text-lg font-bold tracking-tight">
            Job<span className="text-primary">Script</span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center" aria-label="Main">
          <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1 shadow-inner">
            {dashboardNavItems.map(({ href, label, icon, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 font-home-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                    active
                      ? 'bg-background text-primary shadow-sm ring-1 ring-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon icon={icon} className={`text-lg ${active ? 'text-primary' : ''}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/settings"
            className={`flex rounded-lg p-2.5 transition-colors ${
              pathname.startsWith('/settings')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <Icon icon="hugeicons:settings-01" className="text-xl" />
          </Link>
          <div className="border-l border-border/60 pl-3">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
