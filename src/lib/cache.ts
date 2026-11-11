/**
 * 캐시 태그와 수명을 한곳에 모은다.
 *
 * 읽기 함수는 "use cache" 안에서 cacheTag(TAGS.x) + cacheLife(LIFE.x) 를 부르고,
 * 쓰기 서버 액션은 updateTag(TAGS.x) 로 해당 태그를 바로 비운다 (쓴 사람이 다음 화면에서 곧바로 결과를 본다).
 *
 * 수명 값(초)
 * - stale: 브라우저(클라이언트 라우터)가 서버에 다시 묻지 않고 쓰는 시간
 * - revalidate: 이 시간이 지난 뒤 첫 요청이 오면 옛 내용을 주면서 백그라운드에서 새로 만든다
 * - expire: 이 시간이 지나면 새로 만들 때까지 기다린다
 * 태그 무효화가 기본 경로이고, 수명은 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꾼 경우의 안전망이다.
 */
export const TAGS = {
  /** 글 목록·본문·카테고리 */
  posts: "posts",
  /** 글 하나의 댓글 */
  comments: (slug: string) => `comments:${slug}`,
  guestbook: "guestbook",
} as const;

export const LIFE = {
  /** 글은 관리자만 바꾸고 액션이 태그를 비우므로 길게 둔다 */
  posts: { stale: 60, revalidate: 300, expire: 3600 },
  /** 댓글·방명록은 방문자가 쓰는 내용이라 짧게 둔다 */
  comments: { stale: 30, revalidate: 60, expire: 600 },
  guestbook: { stale: 30, revalidate: 60, expire: 600 },
} as const;
