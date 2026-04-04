export function TerminalMockup() {
  return (
    <div className="overflow-hidden rounded border border-border bg-card p-6 shadow-xl">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground/30">
        <div className="size-2.5 rounded-full bg-border" />
        <div className="size-2.5 rounded-full bg-border" />
        <div className="size-2.5 rounded-full bg-border" />
      </div>
      <div className="space-y-3 font-home-mono text-[10px]">
        <div className="flex gap-3">
          <span className="text-primary">01</span>
          <span className="text-muted-foreground">SCANNING_GIT_REPOS...</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary">02</span>
          <span className="text-foreground">PARSING: 3,420 commits</span>
        </div>
        <div className="ml-6 flex gap-3">
          <span className="text-chart-2"># SYSTEMS</span>
          <span className="text-chart-1"># RUST</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border/20">
          <div className="h-full w-[65%] animate-pulse bg-primary" />
        </div>
      </div>
    </div>
  );
}
