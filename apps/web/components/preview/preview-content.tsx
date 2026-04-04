export function PreviewResumeCard() {
  return (
    <article className="rounded border border-border bg-background p-5">
      <h2 className="text-4xl font-black">H. Kang</h2>
      <p className="mt-2 text-xs text-cyan-400">hkang@dev.system</p>
      <h3 className="mt-6 text-xs uppercase text-cyan-400">Overview</h3>
      <p className="mt-2 text-sm">
        Lead Platform Engineer focused on distributed systems and cloud-native scaling protocols.
      </p>
      <h3 className="mt-6 text-xs uppercase text-cyan-400">Tech Stack</h3>
      <p className="mt-2 text-sm">Rust, Go, C++, Kubernetes, AWS, Terraform</p>
    </article>
  );
}
