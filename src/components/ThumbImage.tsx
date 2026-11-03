"use client";

import { useCallback, useState } from "react";
import Spinner from "./Spinner";

/**
 * 목록 카드 썸네일: 불러오는 동안 스피너를 보여주고, 다 받으면 서서히 나타낸다.
 * 부모는 relative 여야 한다 (스피너를 가운데에 겹쳐 둠).
 */
export default function ThumbImage({ src, className = "" }: { src: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  // 하이드레이션 전에 이미 받아진(캐시) 이미지는 onLoad 가 오지 않으므로 마운트 때 확인한다
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
