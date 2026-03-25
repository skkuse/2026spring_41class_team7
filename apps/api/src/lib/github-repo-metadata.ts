export type GithubRepoSnapshot = {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
  languages: Record<string, number>;
  topics: string[];
  readmeExcerpt: string | null;
};

export class GithubFetchError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 502,
  ) {
    super(message);
    this.name = 'GithubFetchError';
  }
}

const GITHUB_API = 'https://api.github.com';

export function parseGithubRepoUrl(input: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(input.trim());
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') {
      return null;
    }
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    let repo = parts[1];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);
    return { owner, repo };
  } catch {
    return null;
  }
}

async function ghFetch(path: string, token: string | undefined): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'team7-jobscript-api',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  return res;
}

export async function fetchGithubRepoSnapshot(repoUrl: string): Promise<GithubRepoSnapshot> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) {
    throw new GithubFetchError('Invalid GitHub repository URL.', 400);
  }

  const { owner, repo } = parsed;
  const token = process.env.GITHUB_TOKEN?.trim();

  const repoRes = await ghFetch(`/repos/${owner}/${repo}`, token);
  if (repoRes.status === 404) {
    throw new GithubFetchError('Repository not found or not accessible.', 404);
  }
  if (!repoRes.ok) {
    throw new GithubFetchError(`GitHub API error (${repoRes.status}).`, 502);
  }

  const repoJson = (await repoRes.json()) as {
    html_url: string;
    description: string | null;
    default_branch: string;
  };

  const [langRes, topicsRes, readmeRes] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}/languages`, token),
    ghFetch(`/repos/${owner}/${repo}/topics`, token),
    ghFetch(`/repos/${owner}/${repo}/readme`, token),
  ]);

  const languages: Record<string, number> = langRes.ok
    ? ((await langRes.json()) as Record<string, number>)
    : {};

  let topics: string[] = [];
  if (topicsRes.ok) {
    const t = (await topicsRes.json()) as { names?: string[] };
    topics = t.names ?? [];
  }

  let readmeExcerpt: string | null = null;
  if (readmeRes.ok) {
    const readmeJson = (await readmeRes.json()) as { content?: string; encoding?: string };
    if (readmeJson.content && readmeJson.encoding === 'base64') {
      const decoded = Buffer.from(readmeJson.content.replace(/\n/g, ''), 'base64').toString('utf8');
      readmeExcerpt = decoded.slice(0, 12000);
    }
  }

  return {
    owner,
    repo,
    htmlUrl: repoJson.html_url,
    description: repoJson.description,
    defaultBranch: repoJson.default_branch,
    languages,
    topics,
    readmeExcerpt,
  };
}
