'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { createBrowserSupabase } from '../../lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<string | null>(authError ? 'Authentication failed. Try again.' : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account, then sign in.');
        setLoading(false);
        return;
      }

      router.refresh();
      router.push('/');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'OAuth failed.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md border border-border bg-card rounded-2xl p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p className="text-sm text-muted-foreground mt-1">Supabase Auth — session access token is sent to the API automatically.</p>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 py-2 rounded border ${mode === 'signin' ? 'border-primary text-primary' : 'border-border'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 rounded border ${mode === 'signup' ? 'border-primary text-primary' : 'border-border'}`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border border-border bg-black/30 px-4 py-3"
        />
        <input
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded border border-border bg-black/30 px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded bg-primary text-black font-semibold disabled:opacity-50"
        >
          {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-card px-2">or</span>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => void signInWithGoogle()}
        className="w-full py-3 rounded border border-border font-medium disabled:opacity-50"
      >
        Continue with Google
      </button>

      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}

      <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        ← Back to app
      </Link>
    </div>
  );
}
