import { Suspense } from "react";
import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory } from "@/lib/posts";

export const metadata = {
  title: "About",
  description: "공부하는 개발자의 테크 블로그 — 프론트엔드, 백엔드, AI를 공부하며 정리한 기록",
};

/** 카테고리별 소개 문구 (글 수는 실제 데이터에서 계산) */
const TOPICS: { name: string; summary: string; items: string[] }[] = [
  {
    name: "FE",
    summary: "화면을 만드는 기술. 자바스크립트의 동작 원리부터 React, Next.js까지 기초를 단단히 다집니다.",
    items: [
      "Javascript — 함수, this, 실행 컨텍스트와 클로저, 이벤트 루프, 변수",
      "React — 렌더링 원리, 이펙트, 순수 컴포넌트와 불변성, 폼 상태, useReducer, Context API",
      "Next.js — App Router, 라우팅, 데이터 패칭, Route Handlers, Server Action, 캐싱, TanStack Query v5",
    ],
  },
  {
    name: "AI",
    summary: "데이터를 다루고 모델을 학습시키는 과정을 파이썬 코드로 직접 따라가며 정리합니다.",
    items: [
      "Python — 데이터 타입, 제어문, 함수, 파일 다루기, 정규 표현식, 클래스, 예외",
      "데이터 분석 — NumPy, Pandas, Matplotlib, 공공 데이터 분석 실습",
      "머신러닝 — 분류·회귀, 로지스틱 회귀, 경사 하강법, 결정 트리, 앙상블, 군집, 주성분 분석",
      "딥러닝 — 인공신경망, 심층신경망, 모델 훈련, 합성곱 신경망",
    ],
  },
  {
    name: "BE",
    summary: "서버 쪽으로 시야를 넓히는 기록. 타입스크립트 기반의 Nest.js를 공부하고 있습니다.",
    items: ["Nest.js — 타입스크립트로 확장된 Node.js"],
  },
  {
    name: "리뷰",
    summary: "컨퍼런스와 행사에서 배운 점, 취업 준비 과정에서 느낀 점을 남깁니다.",
    items: ["취업 콘서트 리뷰"],
  },
];

const STACK = [
  ["프레임워크", "Next.js 16 (App Router) · React 19 · TypeScript"],
  ["스타일", "Tailwind CSS v4 · Pretendard"],
  ["콘텐츠", "Supabase(Postgres)에 글 저장 · Markdown / HTML · 코드 하이라이팅(shiki)"],
  ["관리자", "WYSIWYG 에디터(Tiptap) · 파일 트리·코드 블록 · 카테고리 관리 · 허용 IP + GitHub 계정 인증"],
  ["댓글", "GitHub OAuth 로그인 기반 댓글과 답글"],
];

async function Topics() {
  const [categories, posts] = await Promise.all([getCategories(), getAllPosts()]);
  const order = new Map(categories.map((c, i) => [c.name, i]));
  const topics = [...TOPICS].sort((a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {topics.map((t) => {
        const count = posts.filter((p) => inCategory(p, t.name)).length;
        return (
          <section key={t.name} className="card card-pad flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="text-heading">{t.name}</h3>
              <Link href={categoryHref(t.name)} className="text-sm font-medium text-strong hover:underline">
                글 {count}개 보기 →
              </Link>
            </div>
            <p className="text-body-sm mt-3 text-muted">{t.summary}</p>
            <ul className="text-body-sm mt-4 space-y-2 text-detail-desc">
              {t.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-meta" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-title mt-14 mb-5 sm:mt-20 sm:mb-6">{children}</h2>
);

export default function About() {
  return (
    <div className="container-prose pb-20 sm:pb-24">
      <section className="pt-10 sm:pt-16">
        <h1 className="text-display">About</h1>
        <p className="text-body mt-2 text-muted sm:mt-3 sm:text-lg">
          공부하는 개발자의 테크 블로그
          <br />
          배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남깁니다
        </p>
      </section>

      <H2>이 블로그는</H2>
      <div className="text-body space-y-4 text-detail-desc sm:text-[17px]">
        <p>
          Eunhaa Tech Developer Blog는 개발을 공부하며 이해한 내용을 직접 정리해 두는 공간입니다. 2026년 4월 Tistory에서
          시작해 파이썬 기초와 데이터 분석, 머신러닝에서 출발했고, 이후 자바스크립트와 React, Next.js 같은 프론트엔드 쪽으로
          공부의 폭을 넓혀 왔습니다.
        </p>
        <p>
          지금은 Tistory에 쌓아 온 글을 모두 이 블로그로 옮겨 와 직접 운영합니다. 글의 분류, 화면, 댓글, 글쓰기 도구까지
          스스로 만들고 고쳐 가며, 블로그를 만드는 과정 자체도 하나의 공부로 삼고 있습니다.
        </p>
      </div>

      <H2>다루는 주제</H2>
      <Suspense fallback={null}>
        <Topics />
      </Suspense>

      <H2>글을 쓰는 방식</H2>
      <ul className="text-body space-y-3 text-detail-desc sm:text-[17px]">
        <li>
          <b className="text-foreground">원리를 먼저.</b> 사용법만 나열하기보다 왜 그렇게 동작하는지, 어떤 문제를 풀려고
          만들어진 기능인지부터 이해하려고 합니다.
        </li>
        <li>
          <b className="text-foreground">코드로 확인.</b> 설명한 내용은 가능한 한 예제 코드를 직접 돌려 보며 확인하고, 그
          코드를 글에 함께 남깁니다.
        </li>
        <li>
          <b className="text-foreground">시리즈로 이어서.</b> 파이썬 기초, 머신러닝, Next.js처럼 주제별로 번호를 붙여
          순서대로 읽을 수 있게 정리합니다.
        </li>
        <li>
          <b className="text-foreground">고쳐 가는 글.</b> 틀린 부분이나 더 나은 이해가 생기면 글을 다시 수정합니다.
          댓글로 알려 주시면 큰 도움이 됩니다.
        </li>
      </ul>

      <H2>이 블로그의 기술</H2>
      <dl className="divide-y divide-line border-y border-line">
        {STACK.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="font-bold">{k}</dt>
            <dd className="text-body-sm text-detail-desc">{v}</dd>
          </div>
        ))}
      </dl>

      <H2>연락 · 링크</H2>
      <ul className="text-body space-y-3 text-detail-desc sm:text-[17px]">
        <li>
          GitHub —{" "}
          <a href="https://github.com/rukadeveloper" target="_blank" rel="noopener noreferrer" className="font-semibold text-strong underline underline-offset-4">
            github.com/rukadeveloper
          </a>
        </li>
        <li>
          예전 블로그(Tistory) —{" "}
          <a href="https://eun-haa.tistory.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-strong underline underline-offset-4">
            eun-haa.tistory.com
          </a>
        </li>
        <li>글에 대한 질문이나 피드백은 각 글 아래 댓글(GitHub 로그인)로 남겨 주세요.</li>
      </ul>
    </div>
  );
}
