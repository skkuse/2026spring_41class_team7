'use client';

import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

type Props = {
  title: string;
  shareUrl: string;
  ogImageUrl: string;
  shareText: string;
  onClose: () => void;
};

const PLATFORMS = [
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    icon: 'mdi:linkedin',
    color: '#0A66C2',
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: 'twitter' as const,
    label: 'X / Twitter',
    icon: 'mdi:twitter',
    color: '#000000',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'facebook' as const,
    label: 'Facebook',
    icon: 'mdi:facebook',
    color: '#1877F2',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
] as const;

type Platform = (typeof PLATFORMS)[number]['key'];

export function ShareModal({ title, shareUrl, ogImageUrl, shareText, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [activePreview, setActivePreview] = useState<Platform>('linkedin');

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCopyText() {
    const full = `${shareText}\n\n${shareUrl}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  }

  function handleShare(platform: (typeof PLATFORMS)[number]) {
    let url: string;
    if (platform.key === 'twitter') {
      url = platform.getUrl(shareUrl, shareText);
    } else {
      url = platform.getUrl(shareUrl);
    }
    window.open(url, '_blank', 'noopener,noreferrer,width=620,height=520');
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const activePlatform = PLATFORMS.find((p) => p.key === activePreview)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading text-base font-bold">Share</h2>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground truncate max-w-[280px]">
              {title}
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

        {/* Platform tabs */}
        <div className="px-5 pt-4 pb-3">
          <div className="mb-3 flex gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActivePreview(p.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  activePreview === p.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon icon={p.icon} className="text-sm" />
                {p.label}
              </button>
            ))}
          </div>

          {/* OG image framed per platform */}
          {activePreview === 'linkedin' && (
            <LinkedInFrame ogImageUrl={ogImageUrl} title={title} url={shareUrl} text={shareText} />
          )}
          {activePreview === 'twitter' && (
            <TwitterFrame ogImageUrl={ogImageUrl} title={title} text={shareText} />
          )}
          {activePreview === 'facebook' && (
            <FacebookFrame ogImageUrl={ogImageUrl} title={title} url={shareUrl} />
          )}

          {/* LinkedIn tip */}
          {activePreview === 'linkedin' && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
              <Icon icon="solar:info-circle-linear" className="mt-0.5 shrink-0 text-sm text-blue-500" />
              <div className="flex-1">
                <p className="font-mono text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  LinkedIn doesn't support pre-filled text. Copy the post text below and paste it after opening LinkedIn.
                </p>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="mt-1.5 flex items-center gap-1 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Icon icon={copiedText ? 'solar:check-circle-bold' : 'solar:copy-linear'} className="text-xs" />
                  {copiedText ? 'Copied!' : 'Copy post text'}
                </button>
              </div>
            </div>
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
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-center transition-colors hover:opacity-80 ${
                  activePlatform.key === p.key
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-border bg-card hover:bg-muted'
                }`}
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
            {copied ? (
              'Link copied!'
            ) : (
              <span className="flex items-center gap-1">
                Copy link
                <span className="max-w-[180px] truncate font-mono text-[9px] text-muted-foreground/60 font-normal">
                  {shareUrl}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Platform frames ───────────────────────────────────────────────────────────

function OgImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full object-cover"
      style={{ aspectRatio: '1200/630' }}
    />
  );
}

function LinkedInFrame({
  ogImageUrl,
  title,
  url,
  text,
}: {
  ogImageUrl: string;
  title: string;
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
        <OgImage src={ogImageUrl} alt={title} />
        <div className="px-3 py-2">
          <p className="font-bold text-[11px] truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        </div>
      </div>
    </div>
  );
}

function TwitterFrame({
  ogImageUrl,
  title,
  text,
}: {
  ogImageUrl: string;
  title: string;
  text: string;
}) {
  const tweetLen = `${text}\n\njobclaw.fyi/…`.length;
  const remaining = 280 - tweetLen;
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
            <OgImage src={ogImageUrl} alt={title} />
            <div className="px-2.5 py-1.5">
              <p className="font-semibold text-[10px] truncate">{title}</p>
              <p className="text-[10px] text-muted-foreground">jobclaw.fyi</p>
            </div>
          </div>
          <p className={`text-[10px] text-right ${remaining < 20 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {remaining} chars remaining
          </p>
        </div>
      </div>
    </div>
  );
}

function FacebookFrame({
  ogImageUrl,
  title,
  url,
}: {
  ogImageUrl: string;
  title: string;
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
        <OgImage src={ogImageUrl} alt={title} />
        <div className="px-3 py-2 bg-muted/30">
          <p className="font-mono text-[9px] uppercase text-muted-foreground">JOBCLAW.FYI</p>
          <p className="font-bold text-[11px] truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        </div>
      </div>
    </div>
  );
}
