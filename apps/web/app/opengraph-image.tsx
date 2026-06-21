import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'Jobclaw — AI portfolio for developers';

const SCORE = 94;
const R = 80;
const CIRC = 2 * Math.PI * R;
const FILLED = (SCORE / 100) * CIRC;

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#faf9f7',
          display: 'flex',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(17,17,24,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Warm glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -60,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,100,66,0.10) 0%, transparent 70%)',
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
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="data:image/png;base64,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" alt="Jobclaw" style={{ height: '32px', width: 'auto' }} />

          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                width: 'fit-content',
                padding: '5px 14px',
                border: '1px solid rgba(201,100,66,0.4)',
                borderRadius: 3,
                background: 'rgba(201,100,66,0.08)',
                color: '#c96442',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c96442', flexShrink: 0 }} />
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
                color: '#111118',
              }}
            >
              <span>Your code,</span>
              <span style={{ color: '#c96442' }}>scored.</span>
              <span>Get hired.</span>
            </div>

            {/* Subline */}
            <div style={{ fontSize: 16, color: 'rgba(17,17,24,0.45)', lineHeight: 1.5 }}>
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
                  border: '1px solid rgba(17,17,24,0.12)',
                  borderRadius: 4,
                  background: 'rgba(17,17,24,0.04)',
                  color: 'rgba(17,17,24,0.5)',
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
            background: 'linear-gradient(to bottom, transparent, rgba(17,17,24,0.1) 20%, rgba(17,17,24,0.1) 80%, transparent)',
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
          {/* Score ring */}
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(201,100,66,0.15)" strokeWidth="10" />
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
              <span style={{ fontSize: 52, fontWeight: 800, color: '#111118', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {SCORE}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(17,17,24,0.38)', letterSpacing: '0.06em', fontWeight: 600, marginTop: 4 }}>
                / 100
              </span>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(17,17,24,0.35)', textAlign: 'center' }}>
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
            <span style={{ fontSize: 20, fontWeight: 800, color: '#c96442', letterSpacing: '-0.01em' }}>
              Top 3%
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(201,100,66,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
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
            color: 'rgba(17,17,24,0.2)',
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
