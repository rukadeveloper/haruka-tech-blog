"use client";

import { useEffect } from "react";

/**
 * 인트로가 보이는 동안만 html 에 data-intro 를 붙인다 (globals.css 가 이 속성을 보고 바탕을 인트로 색 #f7f7f5 로 바꾸고 스크롤을 끈다).
 *
 * CSS 의 :has() 로 화면 안의 표식을 찾지 않는 이유: cacheComponents 에서는 다른 화면으로 넘어가도
 * 이전 화면의 DOM 이 숨겨진 채 남아 있어, 블로그 화면까지 바탕이 바뀌고 스크롤이 잠긴다. 이펙트는 화면이 숨겨질 때 정리된다.
 */
export default function StageLock() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.intro = "";
    return () => {
      delete root.dataset.intro;
    };
  }, []);

  return null;
}
