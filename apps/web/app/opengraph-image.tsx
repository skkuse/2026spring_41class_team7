import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'Jobclaw — AI portfolio for developers';

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.jobclaw.fyi';

async function fetchLogoBase64(): Promise<string | null> {
  try {
    const r = await fetch(`${APP_BASE}/logo.png`, { cache: 'no-store' });
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return `data:image/png;base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

const SCORE = 94;
const R = 80;
const CIRC = 2 * Math.PI * R;
const FILLED = (SCORE / 100) * CIRC;

export default async function OGImage() {
  const logoSrc = await fetchLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(140deg, #09090f 0%, #0e0e1a 60%, #09090f 100%)',
          display: 'flex',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Left panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 64px',
            position: 'relative',
          }}
        >
          {/* Logo — always show text wordmark; overlay image if available */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt="Jobclaw"
                style={{ height: '30px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <span
                style={{
                  color: '#f0f0f8',
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                JOBCLAW
              </span>
            )}
          </div>

          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                width: 'fit-content',
                padding: '5px 14px',
                border: '1px solid rgba(201,100,66,0.35)',
                borderRadius: 3,
                background: 'rgba(201,100,66,0.08)',
                color: '#e07a52',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c96442', flexShrink: 0 }} />
              AI Code Assessment
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: 62,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                display: 'flex',
                flexDirection: 'column',
                color: '#f0f0f8',
              }}
            >
              <span>Your code,</span>
              <span style={{ color: '#c96442' }}>scored.</span>
              <span>Get hired.</span>
            </div>

            {/* Subline */}
            <div style={{ fontSize: 16, color: 'rgba(240,240,248,0.4)', lineHeight: 1.5 }}>
              Connect GitHub · run an AI assessment · land in the talent directory.
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['⚡ GitHub-powered', '🤖 AI Assessment', '🎯 Talent Directory'].map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  border: '1px solid rgba(240,240,248,0.08)',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(240,240,248,0.55)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)',
            flexShrink: 0,
          }}
        />

        {/* Right panel — score ring */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 40px',
            position: 'relative',
            gap: 20,
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,100,66,0.15) 0%, transparent 70%)',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 'auto',
            }}
          />

          {/* Score ring */}
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke="#c96442"
                strokeWidth="10"
                strokeDasharray={`${FILLED} ${CIRC - FILLED}`}
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 52, fontWeight: 800, color: '#f0f0f8', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {SCORE}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(240,240,248,0.38)', letterSpacing: '0.06em', fontWeight: 600, marginTop: 4 }}>
                / 100
              </span>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.35)', textAlign: 'center' }}>
            Overall Score
          </div>

          {/* Rank chip */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '12px 24px',
              border: '1px solid rgba(201,100,66,0.3)',
              borderRadius: 4,
              background: 'rgba(201,100,66,0.07)',
              width: '100%',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: '#e07a52', letterSpacing: '-0.01em' }}>
              Top 3%
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(224,122,82,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Global Rank
            </span>
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 28,
            fontSize: 11,
            color: 'rgba(240,240,248,0.15)',
            letterSpacing: '0.06em',
          }}
        >
          jobclaw.fyi
        </div>
      </div>
    ),
    { ...size },
  );
}
