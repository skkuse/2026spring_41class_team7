import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { runOAuthFlow } from '../lib/browser-auth.js';
import { saveSession, getSession } from '../lib/auth-store.js';

type Props = {
  onDone: (code: number) => void;
};

type State =
  | { kind: 'checking' }
  | { kind: 'waiting' }
  | { kind: 'success'; username: string }
  | { kind: 'error'; message: string };

export default function LoginCommand({ onDone }: Props) {
  const [state, setState] = useState<State>({ kind: 'checking' });
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    void (async () => {
      const existing = await getSession();
      if (existing) {
        setState({ kind: 'success', username: existing.user.githubUsername });
        onDone(0);
        return;
      }

      setState({ kind: 'waiting' });

      const result = await runOAuthFlow((url) => {
        console.error(`Opening browser for GitHub login…\nIf it did not open, visit:\n  ${url}\n`);
      });

      if (!result.ok) {
        setState({ kind: 'error', message: result.error });
        onDone(1);
        return;
      }

      await saveSession(result.session);
      setState({ kind: 'success', username: result.session.user.githubUsername });
      onDone(0);
    })();
  }, [onDone]);

  if (state.kind === 'checking' || state.kind === 'waiting') {
    return (
      <Box flexDirection="column">
        <Text dimColor>
          {state.kind === 'checking' ? 'Checking session…' : 'Waiting for browser login…'}
        </Text>
      </Box>
    );
  }

  if (state.kind === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">Login failed: {state.message}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="green">✓ Logged in as @{state.username}</Text>
    </Box>
  );
}
