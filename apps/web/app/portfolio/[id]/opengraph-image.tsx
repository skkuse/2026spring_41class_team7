import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type Section = { overallScore: number; repoOwner: string; repoName: string; headline: string };

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let name = 'Software Portfolio';
  let sections: Section[] = [];

  try {
    const res = await fetch(`${API_BASE}/v1/documents/${id}/view`, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      name = doc.name;
      sections = doc.sections ?? [];
    }
  } catch {
    // use defaults
  }

  const projectCount = sections.length;
  const avgScore =
    projectCount > 0
      ? Math.round(sections.reduce((sum, s) => sum + s.overallScore, 0) / projectCount)
      : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1228 60%, #120d1f 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#c96442',
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            JOBCLAW
          </div>
          <span
            style={{
              color: '#666',
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Software Portfolio
          </span>
        </div>

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: projectCount > 0 ? '52px' : '60px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: '920px',
            }}
          >
            {name}
          </div>

          {projectCount > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <div
                style={{
                  background: 'rgba(201,100,66,0.15)',
                  border: '1px solid rgba(201,100,66,0.3)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ color: '#e87a52', fontSize: '28px', fontWeight: 800 }}>
                  {projectCount}
                </span>
                <span
                  style={{
                    color: '#666',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {projectCount === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              {avgScore > 0 && (
                <div
                  style={{
                    background: 'rgba(201,100,66,0.15)',
                    border: '1px solid rgba(201,100,66,0.3)',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ color: '#e87a52', fontSize: '28px', fontWeight: 800 }}>
                    {avgScore}
                    <span style={{ fontSize: '16px', color: '#888' }}>/100</span>
                  </span>
                  <span
                    style={{
                      color: '#666',
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Avg Score
                  </span>
                </div>
              )}

              {sections.slice(0, 3).map((s) => (
                <div
                  key={s.repoOwner + s.repoName}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    maxWidth: '200px',
                  }}
                >
                  <span
                    style={{
                      color: '#aaa',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.repoOwner}/{s.repoName}
                  </span>
                  <span
                    style={{
                      color: '#ddd',
                      fontSize: '13px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.headline}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div
          style={{
            color: '#333',
            fontSize: '13px',
            letterSpacing: '0.05em',
          }}
        >
          jobclaw.fyi/portfolio/{id}
        </div>
      </div>
    ),
    { ...size },
  );
}
