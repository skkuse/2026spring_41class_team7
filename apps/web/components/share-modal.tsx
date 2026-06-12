'use client';

import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

type Props = {
  docId: string;
  docName: string;
  onClose: () => void;
};

const PLATFORMS = [
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    icon: 'skill-icons:linkedin',
    getUrl: (url: string, text: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
  },
  {
    key: 'twitter' as const,
    label: 'X / Twitter',
    icon: 'skill-icons:twitter',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'facebook' as const,
    label: 'Facebook',
    icon: 'skill-icons:facebook',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
] as const;

type Platform = (typeof PLATFORMS)[number]['key'];

export function ShareModal({ docId, docName, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [activePreview, setActivePreview] = useState<Platform>('linkedin');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jobclaw.fyi';
  const shareUrl = `${origin}/portfolio/${docId}`;
  const ogImageUrl = `${origin}/portfolio/${docId}/opengraph-image`;
  const shareText = `Check out my software portfolio — built from real GitHub repos with AI-powered analysis on Jobclaw.`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShare(platform: (typeof PLATFORMS)[number]) {
    const url = platform.key === 'facebook'
      ? platform.getUrl(shareUrl)
      : platform.getUrl(shareUrl, shareText);
    window.open(url, '_blank', 'noopener,noreferrer,width=620,height=520');
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading text-base font-bold">Share Portfolio</h2>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground truncate max-w-[280px]">
              {docName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:close-circle-linear" className="text-lg" />
          </button>
        </div>

        {/* Preview tabs */}
        <div className="px-5 pt-4 pb-3">
          <div className="mb-3 flex gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActivePreview(p.key)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  activePreview === p.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Real OG image preview wrapped in platform chrome */}
          {activePreview === 'linkedin' && (
            <LinkedInFrame ogImageUrl={ogImageUrl} name={docName} url={shareUrl} text={shareText} />
          )}
          {activePreview === 'twitter' && (
            <TwitterFrame ogImageUrl={ogImageUrl} name={docName} text={shareText} />
          )}
          {activePreview === 'facebook' && (
            <FacebookFrame ogImageUrl={ogImageUrl} name={docName} url={shareUrl} />
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleShare(p)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-center transition-colors hover:bg-muted"
              >
                <Icon icon={p.icon} className="text-2xl" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-mono text-xs font-bold transition-colors hover:bg-muted"
          >
            <Icon
              icon={copied ? 'solar:check-circle-bold' : 'solar:link-bold'}
              className={`text-base ${copied ? 'text-emerald-500' : 'text-muted-foreground'}`}
            />
            {copied ? 'Link copied!' : (
              <>
                Copy link
                <span className="ml-1 max-w-[180px] truncate font-mono text-[9px] text-muted-foreground/60 font-normal">
                  {shareUrl}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Platform frame components ─────────────────────────────────────────────────

function LinkedInFrame({
  ogImageUrl,
  name,
  url,
  text,
}: {
  ogImageUrl: string;
  name: string;
  url: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-muted-foreground/20" />
        <div>
          <p className="font-semibold text-[11px]">You</p>
          <p className="text-[10px] text-muted-foreground">1st · Just now</p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-foreground line-clamp-2">{text}</p>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <img src={ogImageUrl} alt={name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
        <div className="px-3 py-2">
          <p className="font-bold text-[11px] truncate">{name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        </div>
      </div>
    </div>
  );
}

function TwitterFrame({
  ogImageUrl,
  name,
  text,
}: {
  ogImageUrl: string;
  name: string;
  text: string;
}) {
  const full = `${text}\n\njobclaw.fyi/portfolio/…`;
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-2">
      <div className="flex gap-2">
        <div className="h-7 w-7 shrink-0 rounded-full bg-muted-foreground/20" />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="font-bold text-[11px]">You</p>
            <p className="text-[10px] text-muted-foreground">@you</p>
          </div>
          <p className="text-[11px] leading-relaxed whitespace-pre-line">{text}</p>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <img src={ogImageUrl} alt={name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
            <div className="px-2.5 py-1.5">
              <p className="font-semibold text-[10px] truncate">{name}</p>
              <p className="text-[10px] text-muted-foreground">jobclaw.fyi</p>
            </div>
          </div>
          <p className={`text-[10px] text-right ${280 - full.length < 20 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {280 - full.length} chars remaining
          </p>
        </div>
      </div>
    </div>
  );
}

function FacebookFrame({
  ogImageUrl,
  name,
  url,
}: {
  ogImageUrl: string;
  name: string;
  url: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-muted-foreground/20" />
        <div>
          <p className="font-semibold text-[11px]">You</p>
          <p className="text-[10px] text-muted-foreground">Just now · 🌐</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <img src={ogImageUrl} alt={name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
        <div className="px-3 py-2 bg-muted/30">
          <p className="font-mono text-[9px] uppercase text-muted-foreground">JOBCLAW.FYI</p>
          <p className="font-bold text-[11px] truncate">{name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        </div>
      </div>
    </div>
  );
}
