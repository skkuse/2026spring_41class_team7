import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type Section = {
  overallScore: number;
  repoOwner: string;
  repoName: string;
  headline: string;
  assessmentType?: string;
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let name = 'Software Portfolio';
  let sections: Section[] = [];
  let authorName = '';
  let authorRole = '';

  try {
    const res = await fetch(`${API_BASE}/v1/documents/${id}/view`, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      name = doc.name ?? name;
      sections = doc.sections ?? [];
      authorName = doc.authorName ?? '';
      authorRole = doc.authorRole ?? '';
    }
  } catch {
    // use defaults
  }

  const projectCount = sections.length;
  const avgScore =
    projectCount > 0
      ? Math.round(sections.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / projectCount)
      : 0;

  // Derive a display label from assessment type(s)
  const types = [...new Set(sections.map((s) => s.assessmentType).filter(Boolean))];
  const typeLabel = types.length > 0 ? types[0] : 'GitHub Repo Analysis';

  const avatarLetters = authorName ? initials(authorName) : '?';

  // Score color
  const scoreColor = avgScore >= 80 ? '#4ade80' : avgScore >= 60 ? '#facc15' : '#f87171';

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
        {/* Subtle grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top row: Jobclaw logo + assessment type badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logo mark */}
            <div
              style={{
                width: '32px',
                height: '32px',
                background: '#c96442',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 900,
                color: 'white',
              }}
            >
              J
            </div>
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
          </div>

          {/* Assessment type badge */}
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
            {typeLabel}
          </div>
        </div>

        {/* Middle: portfolio name */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: name.length > 40 ? '44px' : '54px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: '860px',
            }}
          >
            {name}
          </div>

          {/* Stats row */}
          {projectCount > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              {/* Score pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${scoreColor}44`,
                  borderRadius: '10px',
                  padding: '10px 18px',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: scoreColor,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: scoreColor, fontSize: '26px', fontWeight: 800 }}>
                  {avgScore}
                </span>
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

              {/* Project count */}
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
                  {projectCount}
                </span>
                <span
                  style={{
                    color: '#555',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {projectCount === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              {/* Repo chips */}
              {sections.slice(0, 2).map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    maxWidth: '180px',
                  }}
                >
                  <span
                    style={{
                      color: '#666',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.repoOwner}/{s.repoName}
                  </span>
                  <span
                    style={{
                      color: '#bbb',
                      fontSize: '12px',
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

        {/* Bottom row: author + URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Author */}
          {authorName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c96442, #8b3d80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {avatarLetters}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ color: '#ddd', fontSize: '14px', fontWeight: 700 }}>{authorName}</span>
                {authorRole && (
                  <span style={{ color: '#555', fontSize: '12px' }}>{authorRole}</span>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          <span style={{ color: '#333', fontSize: '13px', letterSpacing: '0.04em' }}>
            jobclaw.fyi/portfolio/{id}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
