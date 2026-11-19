"use client";

import { useEffect, useRef } from "react";

/**
 * 화면 전체를 덮는 배경 영상.
 * React 는 클라이언트에서 만든 video 에 muted 를 속성이 아닌 프로퍼티로만 넣어서,
 * 다른 화면에서 넘어왔을 때 자동 재생이 막히는 브라우저가 있다. 마운트한 뒤 직접 음소거하고 재생한다.
 */
export default function BgVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    // 절전 모드 등으로 재생이 거부되면 첫 장면에 멈춘 채로 둔다
    video.play().catch(() => {});
    // 다른 화면으로 넘어가 숨겨진 동안에는 재생을 멈춘다 (돌아오면 이 이펙트가 다시 재생한다)
    return () => video.pause();
  }, []);

  return (
    <video ref={ref} className={className} autoPlay muted loop playsInline>
      <source src={src} type="video/mp4" />
    </video>
  );
}
