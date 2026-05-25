import { redirect } from 'next/navigation';

import { createServerSupabase } from '../lib/supabase/server';
import { Landing } from '../components/landing';

export default async function EntryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');
  return <Landing />;
}
