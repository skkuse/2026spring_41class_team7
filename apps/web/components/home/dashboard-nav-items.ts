export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
};

export const dashboardNavItems: readonly DashboardNavItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: 'hugeicons:home-03',
    match: (p) => p === '/home',
  },
  {
    href: '/builder',
    label: 'Build',
    icon: 'hugeicons:magic-wand-01',
    match: (p) => p.startsWith('/builder'),
  },
  {
    href: '/portfolios',
    label: 'Portfolios',
    icon: 'hugeicons:folder-01',
    match: (p) => p.startsWith('/portfolios'),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: 'hugeicons:user',
    match: (p) => p.startsWith('/profile'),
  },
] as const;

const DASHBOARD_PATH_PREFIXES = [
  '/home',
  '/builder',
  '/portfolios',
  '/profile',
  '/settings',
  '/preview',
] as const;

export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
