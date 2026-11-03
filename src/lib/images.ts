// 본문 이미지에 로딩 표시를 단다. node:fs 를 쓰지 않아 클라이언트(에디터 미리보기)에서도 가져올 수 있다.
//
// 본문은 HTML 문자열(dangerouslySetInnerHTML)이라 React 의 onLoad 를 쓸 수 없다.
// 대신 img 에 data-pending 과 인라인 onload/onerror 를 달아 두면, 하이드레이션 여부와 상관없이
// 이미지가 로드되는 순간 속성이 지워지고 CSS(.post-body img[data-pending])의 스피너가 사라진다.

const DONE = "this.removeAttribute('data-pending')";

export function markImagesPending(html: string): string {
  return html.replace(/<img\b(?![^>]*\sdata-pending\b)/gi, `<img data-pending onload="${DONE}" onerror="${DONE}"`);
}
