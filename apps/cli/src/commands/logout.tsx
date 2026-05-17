import React, { useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { clearSession, getSession } from '../lib/auth-store.js';

type Props = {
  onDone: (code: number) => void;
};

export default function LogoutCommand({ onDone }: Props) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    void (async () => {
      const session = await getSession();
      if (!session) {
        onDone(0);
        return;
      }
      await clearSession();
      onDone(0);
    })();
  }, [onDone]);

  return (
    <Box flexDirection="column">
      <Text color="green">✓ Logged out</Text>
    </Box>
  );
}
