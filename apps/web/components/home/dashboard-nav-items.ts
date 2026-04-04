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
    label: 'Gen',
    icon: 'hugeicons:magic-wand-01',
    match: (p) => p.startsWith('/builder'),
  },
  {
    href: '/documents',
    label: 'Docs',
    icon: 'hugeicons:folder-01',
    match: (p) => p.startsWith('/documents'),
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
  '/documents',
  '/profile',
  '/settings',
  '/preview',
] as const;

export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
