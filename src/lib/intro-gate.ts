/**
 * 블로그 홈(/)에 처음 들어오거나 홈에서 새로고침하면 인트로(/intro)로 보낸다. 사이트 안에서 이동할 때는 보내지 않는다.
 * 규칙 전체는 docs/intro "진입 규칙". proxy.ts 가 쓴다.
 */

/** 인트로 주소 */
export const INTRO_PATH = "/intro";

/**
 * 브라우저가 문서를 새로 받는 요청인지 (주소창 입력, 새로고침, 다른 사이트에서 온 링크).
 *
 * 그런 요청에는 Sec-Fetch-Dest: document 가 붙는다. 사이트 안 이동(Next 의 RSC 요청)과 프리패치는 empty 라서 걸리지 않는다.
 * Next 는 프록시에서 rsc 같은 내부 헤더를 지우므로 그 헤더로는 구분할 수 없다.
 *
 * 이 헤더를 보내지 않는 클라이언트(검색 로봇, 아주 오래된 브라우저)는 false 다 — 로봇은 글 목록을 그대로 읽어야 한다.
 */
export const isFullPageLoad = (headers: Headers) => headers.get("sec-fetch-dest") === "document";
