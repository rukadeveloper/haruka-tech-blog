---
title: "[Nest.js] 요청 라이프 사이클 및 컨트롤러"
date: "2026-09-22"
category: "BE/Nest.js"
description: "요청 라이프 사이클 (Request Lifecycle) 요청이 어떤 클라이언트에서 서버로 보내진 다음에 응답이 되어 돌아오는 과정을 표현한 것입니다. 전체적인 파이프라인은 아래 그림과 같습니다. 먼저 클라이언트 (현"
tags: []
thumbnail: "/images/posts/draft-87/1.png"
tistoryDraftId: 87
draft: true
---
**요청 라이프 사이클 (Request Lifecycle)**

요청이 어떤 클라이언트에서 서버로 보내진 다음에 응답이 되어 돌아오는 과정을 표현한 것입니다.

전체적인 파이프라인은 아래 그림과 같습니다.

![](/images/posts/draft-87/1.png)

먼저 클라이언트 (현재는 디바이스) 에서 Nest.js 서버로 요청을 하는데

들어오자마자 Middleware에 먼저 트리거되며, Guard -> Interceptor -> Pipe 방향으로 이동합니다.

그 이후에 요청 로직 처리 부분으로 이동하는데, 실질적으로 요청이 들어왔을 때 요청이 요구하는 사항들을 만들어줍니다.

Controller-Service-Repository 레이어에서 3가지가 작용을 하면서 응답을 만들어냅니다.

그리고 만들어진 응답은 Exception Filter를 거치고, Interceptor를 거쳐서 다시 클라이언트에 응답 데이터를 보냅니다.
