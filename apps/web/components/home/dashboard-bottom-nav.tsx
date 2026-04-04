'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { dashboardNavItems } from './dashboard-nav-items';

type NavTone = 'mobile' | 'tablet';

export function DashboardBottomNav({ tone }: { tone: NavTone }) {
  const pathname = usePathname();
  const maxW = tone === 'tablet' ? 'max-w-xl' : 'max-w-md';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-tabbar-safe">
      <div className={`mx-auto flex h-16 w-full max-w-full items-stretch justify-around px-2 ${maxW}`}>
        {dashboardNavItems.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-full flex-col items-center justify-center gap-1 text-[9px] font-home-mono font-bold uppercase transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon icon={icon} className="text-xl" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
