import { redirect } from 'next/navigation';

type Search = { error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const suffix = sp.error ? `?error=${encodeURIComponent(sp.error)}` : '';
  redirect(`/onboarding${suffix}`);
}
