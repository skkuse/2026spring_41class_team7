import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'Jobclaw — AI portfolio for developers';

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.jobclaw.fyi';

async function fetchLogoBase64(): Promise<string | null> {
  try {
    const r = await fetch(`${APP_BASE}/logo.png`);
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

const PILLS = [
  { label: 'GitHub-powered', icon: '⚡' },
  { label: 'AI Assessment', icon: '🤖' },
  { label: 'Talent Directory', icon: '🎯' },
];

export default async function OGImage() {
  const logoSrc = await fetchLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(140deg, #0d0d14 0%, #121220 55%, #0d0d14 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,100,66,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo top-left */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="Jobclaw"
              style={{ height: '34px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <span
              style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              JOBCLAW
            </span>
          )}
        </div>

        {/* Center content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            gap: '24px',
          }}
        >
          {/* Badge */}
          <div style={{ display: 'flex' }}>
            <div
              style={{
                background: 'rgba(201,100,66,0.15)',
                border: '1px solid rgba(201,100,66,0.4)',
                borderRadius: '100px',
                padding: '6px 18px',
                color: '#e87a52',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              For Developers
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Your code, scored.{'\n'}
            <span style={{ color: '#c96442' }}>Get hired faster.</span>
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
            }}
          >
            Connect GitHub · run AI assessments · land in the talent directory.
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {PILLS.map((p) => (
              <div
                key={p.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: '18px' }}>{p.icon}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: '14px',
              letterSpacing: '0.04em',
            }}
          >
            jobclaw.fyi
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
