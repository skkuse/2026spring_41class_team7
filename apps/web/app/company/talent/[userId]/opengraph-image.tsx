import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
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

function scoreColor(score: number) {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#facc15';
  return '#f87171';
}

export default async function OGImage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  let name = 'Developer Profile';
  let role = '';
  let avgScore = 0;
  let rank = 0;
  let assessmentCount = 0;
  let percentile = 0;

  const [logoSrc] = await Promise.all([
    fetchLogoBase64(),
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/profile/stats?userId=${userId}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          avgScore = data.avgScore ?? 0;
          rank = data.rank ?? 0;
          assessmentCount = data.assessmentCount ?? 0;
          percentile = data.percentile ?? 0;
          name = data.name ?? name;
          role = data.role ?? '';
        }
      } catch {
        // use defaults
      }
    })(),
  ]);

  const color = scoreColor(avgScore);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(140deg, #0d0d14 0%, #121220 55%, #0d0d14 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
          position: 'relative',
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

        {/* Top row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
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
                color: 'white',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              JOBCLAW
            </span>
          )}
          <div
            style={{
              background: 'rgba(201,100,66,0.15)',
              border: '1px solid rgba(201,100,66,0.35)',
              borderRadius: '100px',
              padding: '6px 16px',
              color: '#e87a52',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Developer Profile
          </div>
        </div>

        {/* Middle */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '54px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {name}
          </div>
          {role && (
            <div style={{ fontSize: '22px', color: '#666', fontWeight: 500 }}>{role}</div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${color}44`,
                borderRadius: '10px',
                padding: '10px 18px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color, fontSize: '26px', fontWeight: 800 }}>{avgScore}</span>
              <span style={{ color: '#555', fontSize: '16px', fontWeight: 600 }}>/ 100</span>
              <span
                style={{
                  color: '#555',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginLeft: '4px',
                }}
              >
                Avg Score
              </span>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: 'white', fontSize: '26px', fontWeight: 800 }}>
                Top {100 - percentile}%
              </span>
              <span
                style={{
                  color: '#555',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Percentile
              </span>
            </div>

            {rank > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'white', fontSize: '26px', fontWeight: 800 }}>
                  #{rank}
                </span>
                <span
                  style={{
                    color: '#555',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Global Rank
                </span>
              </div>
            )}

            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: 'white', fontSize: '26px', fontWeight: 800 }}>
                {assessmentCount}
              </span>
              <span
                style={{
                  color: '#555',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Assessments
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          <span style={{ color: '#333', fontSize: '13px', letterSpacing: '0.04em' }}>
            jobclaw.fyi/company/talent/{userId}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
