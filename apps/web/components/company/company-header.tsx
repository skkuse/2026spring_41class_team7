'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserMenu } from '../../app/user-menu';

const NAV_ITEMS = [
  { href: '/company/talent', label: 'Talent', icon: 'solar:users-group-two-rounded-linear' },
  { href: '/company/settings', label: 'Settings', icon: 'hugeicons:settings-01' },
];

export function CompanyHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-6 px-6 lg:px-8">
        <Link
          href="/company/talent"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <Image src="/logo.png" alt="Jobclaw" width={120} height={28} className="h-7 w-auto" priority />
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center" aria-label="Company">
          <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1 shadow-inner">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
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

        <div className="ml-auto flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
