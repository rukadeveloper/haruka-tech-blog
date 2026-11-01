import fs from "node:fs";
import path from "node:path";

/**
 * 관리자 화면의 콘텐츠 저장소.
 * GITHUB_CONTENT_TOKEN 이 있으면 GitHub 저장소를 직접 읽고 커밋하고 (Vercel 은 파일을 쓸 수 없다),
 * 없으면 로컬 파일을 그대로 쓴다. 경로는 모두 저장소 루트 기준이다.
 */
const token = () => process.env.GITHUB_CONTENT_TOKEN;
const repo = () => process.env.GITHUB_CONTENT_REPO || "rukadeveloper/haruka-tech-blog";
const branch = () => process.env.GITHUB_CONTENT_BRANCH || "main";

/** 커밋 메시지에 이 표시가 있으면 vercel.json 의 ignoreCommand 가 재배포를 건너뛴다 */
const SKIP_DEPLOY = "[skip deploy]";
const MAX_COMMIT_ATTEMPTS = 3;

const headers = (accept = "application/vnd.github+json") => ({
  Authorization: `Bearer ${token()}`,
  Accept: accept,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "eunhaa-tech-blog",
});

class GithubError extends Error {
  constructor(readonly status: number, endpoint: string) {
    super(`GitHub API ${status}: ${endpoint}`);
  }
}

async function request(endpoint: string, init?: RequestInit, accept?: string) {
  const res = await fetch(`https://api.github.com/repos/${repo()}${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: headers(accept),
  });
  if (!res.ok) throw new GithubError(res.status, endpoint);
  return res;
}

const api = async (endpoint: string, method = "GET", body?: unknown) =>
  (await request(endpoint, { method, body: body === undefined ? undefined : JSON.stringify(body) })).json();

const contentsUrl = (file: string, ref: string) =>
  `/contents/${file.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`;

/** 파일이 없으면 null */
export async function readContent(file: string): Promise<string | null> {
  if (!token()) {
    const full = path.join(process.cwd(), file);
    return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
  }
  try {
    return await (await request(contentsUrl(file, branch()), undefined, "application/vnd.github.raw+json")).text();
  } catch (e) {
    if (e instanceof GithubError && e.status === 404) return null;
    throw e;
  }
}

type DirEntry = { name: string; object: { text: string | null; isTruncated: boolean } | null };

/** 디렉터리 안의 파일을 파일 이름 → 내용으로 읽는다. 글 목록을 한 번의 요청으로 가져오려고 GraphQL 을 쓴다. */
export async function readContentDir(dir: string): Promise<Record<string, string>> {
  if (!token()) {
    const full = path.join(process.cwd(), dir);
    if (!fs.existsSync(full)) return {};
    return Object.fromEntries(fs.readdirSync(full).map((name) => [name, fs.readFileSync(path.join(full, name), "utf8")]));
  }
  const [owner, name] = repo().split("/");
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    cache: "no-store",
    headers: headers(),
    body: JSON.stringify({
      query: `query($owner: String!, $name: String!, $expression: String!) {
        repository(owner: $owner, name: $name) {
          object(expression: $expression) {
            ... on Tree { entries { name object { ... on Blob { text isTruncated } } } }
          }
        }
      }`,
      variables: { owner, name, expression: `${branch()}:${dir}` },
    }),
  });
  if (!res.ok) throw new GithubError(res.status, "/graphql");
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(`GitHub GraphQL: ${errors[0].message}`);

  const entries: DirEntry[] = data.repository.object?.entries ?? [];
  const files = await Promise.all(
    entries.map(async ({ name, object }) => {
      const text = object?.isTruncated ? await readContent(`${dir}/${name}`) : object?.text;
      return [name, text ?? null] as const;
    })
  );
  return Object.fromEntries(files.filter((f): f is [string, string] => f[1] !== null));
}

export type ContentChange = {
  message: string;
  put?: Record<string, string | Buffer>;
  remove?: string[];
  /** false 면 공개 사이트를 재배포하지 않는다 (임시저장, 이미지) */
  deploy?: boolean;
};

async function commitOnce({ message, put = {}, remove = [], deploy = true }: ContentChange) {
  const { object: { sha: parent } } = await api(`/git/ref/heads/${branch()}`);
  const { tree: { sha: baseTree } } = await api(`/git/commits/${parent}`);

  const tree: Record<string, unknown>[] = [];
  for (const [file, data] of Object.entries(put)) {
    if (typeof data === "string") {
      tree.push({ path: file, mode: "100644", type: "blob", content: data });
    } else {
      const { sha } = await api("/git/blobs", "POST", { content: data.toString("base64"), encoding: "base64" });
      tree.push({ path: file, mode: "100644", type: "blob", sha });
    }
  }
  for (const file of remove) {
    // 트리에 없는 경로를 지우려 하면 GitHub 가 거부한다
    const exists = await request(contentsUrl(file, parent)).then(
      () => true,
      (e) => {
        if (e instanceof GithubError && e.status === 404) return false;
        throw e;
      }
    );
    if (exists) tree.push({ path: file, mode: "100644", type: "blob", sha: null });
  }
  if (!tree.length) return;

  const { sha: newTree } = await api("/git/trees", "POST", { base_tree: baseTree, tree });
  if (newTree === baseTree) return; // 내용이 그대로면 커밋하지 않는다
  const { sha } = await api("/git/commits", "POST", {
    message: deploy ? message : `${message} ${SKIP_DEPLOY}`,
    tree: newTree,
    parents: [parent],
  });
  await api(`/git/refs/heads/${branch()}`, "PATCH", { sha });
}

/** 여러 파일 변경을 커밋 하나로 묶는다. 그사이 브랜치가 움직였으면(422) 다시 시도한다. */
export async function commitContent(change: ContentChange) {
  if (!token()) {
    for (const [file, data] of Object.entries(change.put ?? {})) {
      const full = path.join(process.cwd(), file);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, data);
    }
    for (const file of change.remove ?? []) fs.rmSync(path.join(process.cwd(), file), { force: true });
    return;
  }
  for (let attempt = 1; ; attempt++) {
    try {
      return await commitOnce(change);
    } catch (e) {
      if (!(e instanceof GithubError && e.status === 422) || attempt >= MAX_COMMIT_ATTEMPTS) throw e;
    }
  }
}

/** public/ 아래 파일의 브라우저용 주소. 재배포 전에도 보이도록 GitHub 에서는 raw 주소를 쓴다. */
export const publicFileUrl = (file: string) =>
  token() ? `https://raw.githubusercontent.com/${repo()}/${branch()}/${file}` : `/${file.replace(/^public\//, "")}`;
