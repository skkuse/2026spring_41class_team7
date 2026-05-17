import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { generatePKCE } from '../pkce.js';

describe('generatePKCE', () => {
  it('returns base64url verifier and challenge', () => {
    const { verifier, challenge } = generatePKCE();
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('challenge is SHA-256 of verifier base64url-encoded', () => {
    const { verifier, challenge } = generatePKCE();
    const expected = createHash('sha256').update(verifier).digest('base64url');
    expect(challenge).toBe(expected);
  });

  it('generates unique values each call', () => {
    const a = generatePKCE();
    const b = generatePKCE();
    expect(a.verifier).not.toBe(b.verifier);
  });
});
