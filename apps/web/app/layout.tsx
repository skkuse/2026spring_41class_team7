
import './globals.css';

import { AppProviders } from './providers';

export const metadata = {
  title: 'Signal UI Mock App',
  description: 'Tailwind mock UI screens in Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
