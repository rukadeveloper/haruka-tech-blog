"use client";

import { useEffect } from "react";

/**
 * 에디터가 보이는 동안만 html 에 data-studio 와 글꼴 변수 클래스를 붙인다 (docs/editor).
 * html 에 붙여야 body 로 띄우는 팝오버(Select 목록 등)까지 벤토 토큰 · 글꼴을 받는다.
 * cacheComponents 가 화면을 숨기면 이펙트가 정리되어 블로그 화면은 원래 토큰으로 돌아간다.
 */
export default function StudioTheme({ fontClassName }: { fontClassName: string }) {
  useEffect(() => {
    const html = document.documentElement;
    const classes = fontClassName.split(" ").filter(Boolean);
    html.dataset.studio = "";
    html.classList.add(...classes);
    return () => {
      delete html.dataset.studio;
      html.classList.remove(...classes);
    };
  }, [fontClassName]);
  return null;
}
