import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type GitTimeline = {
  start: string | null;
  end: string | null;
};

export type GitHubRepoSlug = {
  username: string;
  repo: string;
};

function parseGithubRemote(rawUrl: string): GitHubRepoSlug | null {
  const u = rawUrl.trim();
  const ssh = /^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i.exec(u);
  if (ssh) return { username: ssh[1], repo: ssh[2].replace(/\.git$/i, "") };
  const https = /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/i.exec(u);
  if (https) return { username: https[1], repo: https[2].replace(/\.git$/i, "") };
  return null;
}

export async function gitTimeline(cwd: string): Promise<GitTimeline> {
  try {
    const { stdout: first } = await execFileAsync(
      "git",
      ["log", "--reverse", "--format=%cI", "-1"],
      { cwd },
    );
    const { stdout: last } = await execFileAsync(
      "git",
      ["log", "--format=%cI", "-1"],
      { cwd },
    );
    return {
      start: first.trim() || null,
      end: last.trim() || null,
    };
  } catch {
    return { start: null, end: null };
  }
}

export async function gitOriginSlug(cwd: string): Promise<GitHubRepoSlug | null> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["config", "--get", "remote.origin.url"],
      { cwd },
    );
    return parseGithubRemote(stdout);
  } catch {
    return null;
  }
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["rev-parse", "--git-dir"], { cwd });
    return true;
  } catch {
    return false;
  }
}
