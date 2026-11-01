---
title: "[React Basic] 랜더링 없이 데이터를 보관하는 useRef"
date: "2026-09-14"
category: ""
description: "탄생 배경 분명히 어떤 값은 기억해야 하는데, 화면을 다시 그릴 필요는 없을 때 사용하기 위해 등장했습니다. 우리가 지금까지 배운 값을 저장하는 State는 값 변경되면 리 랜더링되는 일종의 요란한 전광판과 같습니다"
tags: []
thumbnail: "/images/posts/draft-80/1.png"
tistoryDraftId: 80
draft: true
---
>  탄생 배경

분명히 어떤 값은 기억해야 하는데, 화면을 다시 그릴 필요는 없을 때 사용하기 위해 등장했습니다.

우리가 지금까지 배운 값을 저장하는 State는 값 변경되면 리 랜더링되는 일종의 요란한 전광판과 같습니다.

반면에 useRef는 비밀수첩과 같은 역할로, 값을 변경한다고 해서 화면이 리 랜더링 되지는 않습니다.

리액트 컴포넌트는 상태가 바뀔때마다 함수 전체가 다시 실행되므로, 일반 변수는 초기화가 되어 큰 의미가 없습니다.

반면 useRef는 컴포넌트가 아무리 리 랜더링 되어도 적어둔 내용을 컴포넌트가 언마운트 되기 전까지는 유지됩니다.

따라서, useRef는 다음과 같이 참조 객체를 선언할 수 있습니다.

```javascript
const myRef = useRef(0) // useRef(초기값)
```

이렇게 선언하고 나면 current 속성에 접근해, 안에 담긴 값을 확인하는 것이 가능합니다.

혹은 .current에 새로운 값을 할당하여 값을 수정할 수도 있습니다.

```javascript
console.log(myRef.current) // 0
myRef.current = 10
```

여기서 주목할 점은 이 값을 아무리 수정해도 화면은 절대 리 랜더링 되지 않습니다.

리액트의 랜더링 사이클과는 별개로 독립적으로 작동하면서도 컴포넌트의 전 생애주기동안 값이 유지됩니다.

> DOM을 직접적으로 제어하기

useRef를 통해 실제 DOM 요소에 직접 접근하여, 물리적인 제어를 수행하는 방법에 대해 다룹니다.

React는 선언형 프로그래밍이지만, 가끔은 React의 통제를 벗어나 명령형으로 처리해야 하는 경우가 생깁니다.

input 창에 포커스를 주거나, scroll 위치를 강제로 수정하는 것이 그 예입니다.

왜 React에서 실제 DOM을 건드려야 하는지 살펴보겠습니다.

위에서 살펴봤다 시피 실제 React의 제어 환경에서 벗어나 DOM 요소를 조작하기 위해 그렇습니다.

실제 실습 예제를 살펴보겠습니다.

**1\. 먼저, 초기값을 null로 선언한 참조 객체를 선언합니다.** 

```javascript
const inputRef = useRef(null)
```

**2\. 실제 html 요소와 연결하기 위해 ref 속성을 이용하여 연결합니다.**

```html
<input ref={inputRef} type="text" />
```

**3\. 연결이 완료되고 난 후 current 속성 통해 실제 요소에 접근합니다.**

```javascript
inputRef.current.focus()
```

> 실전 활용 - 이전 값 추적

**우리가 마주할 상황**은 현재의 값이 이전의 값과 비교해 얼마나 변했는지 알아내야 하는 순간입니다.

앞서 배운 useState는 매번 교체되는 사진첩과 같아서, 현재 상태만 기억되며 과거 상태는 소멸됩니다.

지워진 과거 데이터의 필요할 경우, useRef를 활용할 수 있는데

useRef는 React의 랜더링 사이클에 전혀 영향을 주지 않으며, 지난 랜더링 때의 값을 간직해둡니다.

첫번째로, 다음과 같은 상황을 생각해봅시다.

![](/images/posts/draft-80/1.png)

화면은 현재 값인 1,200원을 표시해주지만, 내부적으로는 과거의 값인 1,100원을 기억해두었다가

상승인지 하락인지의 여부를 판단해야 하는 경우입니다.

이를 코드로 구현하려면, 화면이 다 그려진 직후에 실행되는 useEffect 시점을 영리하게 이용하게 됩니다.

아래처럼, 현재 값은 useState로 관리하고 이전 가격은 useRef로 설정합니다.

useEffect 안에서 UI 업데이트가 끝날 시점에 현재 가격(미래의 과거의 가격이 됨)을 useRef에 저장합니다.

다음 가격이 바뀐 후, State는 초기값으로 바뀌는데 이 때 저장해둔 데이터와 비교하게 됩니다.

```bash
function PriceTracker() {
  const [price, setPrice] = useState(1000)
  
  const prevPriceRef = useRef()
  
  useEffect(() => { prevPriceRef.current = price }, [price])
  
  const prevPrice = prevPriceRef.current
  
  return <p> 변동 분석: {price >= prevPrice ? "상승 혹은 유지" : "하락"} </p>
}
```

두번째로 해결해야 할 실무 과제는 불필요한 첫 Mount에 트리거 되는 것을 생략하는 것입니다.

React의 useEffect는 컴포넌트가 무조건 처음 화면에 마운트될 때 무조건 실행되도록 설계되어 있습니다.

예를 들어, 상품이 추가될때만 알림을 띄우고 싶다면, Mount 될때의 로직은 생략하는 것이 좋은 UX의 예시입니다.

이 때 useRef를 이용해 첫 방문인지, 재방문인지 판별하는 비밀 스위치를 만들 수 있습니다.

![](/images/posts/draft-80/2.png)

오직 로직의 흐름을 제어하기 위한 데이터이므로, useState가 아닌 useRef로 관리합니다.

이로 인해 컴포넌트의 생애주기를 우리가 커스터마이징할 수 있습니다.

코드로 이해하면 다음과 같습니다.

```bash
function SkipFirstRender() {
  const [count, setCount] = useState(0)
  
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    if(isFirstRender.current) {
      isFirstRender.current = true
      return
    }
    console.log('알림 전송 로직입니다')
  }, [count])
  
  return (....)
}
```

> 고급 활용 - 타이머 기능
