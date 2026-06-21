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
          {/* Logo — text wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c96442', flexShrink: 0 }} />
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#111118',
              }}
            >
              JOB<span style={{ color: '#c96442' }}>CLAW</span>
            </span>
          </div>

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
