# 플로팅 채팅 위젯 구현 플랜

## Context

사용자가 ElevenLabs 스타일의 플로팅 채팅 위젯을 요청했습니다: ① 스크롤해도 화면에 고정되어 따라다니는 알약(pill) 모양 트리거 버튼, ② 클릭 시 버튼 위에 둥둥 뜨는 카드형 패널이 열리고 그 안에서 실제 채팅(메시지 스레드)을 할 수 있는 UI. 다국어 선택 기능은 요청에서 명시적으로 제외했습니다.

사용자 확인 결과:
- 패널 형태: **앵커드 플로팅 카드**(데스크톱/모바일 동일, 참고 이미지와 동일한 형태) — 풀스크린 모바일 바텀시트는 만들지 않음
- 노출 범위: **전체 페이지** (루트 레이아웃에 전역 마운트)
- 기능 범위: **UI만** — 로컬 state로 동작하는 목업. `docs/chatbot-sdk-plan.md`에 정의된 백엔드 프록시 서버가 아직 없으므로 실제 Claude API 호출은 하지 않음

이 레포는 `docs/chatbot-sdk-plan.md`에서 향후 `@yourorg/chatbot-widget`이라는 공개 npm 패키지로 분리될 가능성이 언급된 상태입니다. 따라서 이번에 만드는 위젯 컴포넌트는 Recoil/Supabase/Auth 컨텍스트에 최대한 의존하지 않고 독립적으로 작동하도록 작성해, 나중에 패키지로 추출하기 쉽게 만듭니다.

## 핵심 기술 결정

- **shadcn "base-nova" 스타일 = Base UI 래핑**. 이 레포는 Radix가 아니라 `@base-ui/react`를 쓰고 있고(`src/components/ui/dialog.tsx` 확인됨), `data-state` 대신 `data-open`/`data-closed` 속성으로 애니메이션을 겁니다. 새 컴포넌트도 이 패턴을 그대로 따릅니다.
- **앵커 포지셔닝에는 Base UI `Popover`를 사용**합니다 (`@base-ui/react/popover`에 이미 존재, 현재 미사용). 직접 만든 `fixed` div보다 이게 나은 이유:
  - `PopoverRoot`가 `outsidePress`/`escapeKey` dismiss를 기본 제공 → 바깥 클릭/ESC로 닫기 로직을 손수 구현할 필요 없음
  - `PopoverPositioner`가 Floating UI 기반 앵커 포지셔닝 제공. 트리거 버튼 자체가 `fixed`이므로 `positionMethod="fixed"`로 지정해 스크롤 중에도 좌표가 어긋나지 않게 함
  - `dialog.tsx`와 동일한 `data-slot`/`data-open`/`data-closed` 패턴을 그대로 재사용 가능
  - 트리거가 화면 우하단 한 곳에 고정이라 동적 flip은 불필요 → `side="top" align="end"` 고정, `collisionAvoidance={{ side: 'none', align: 'none' }}`
- **그라데이션 오브(orb)는 `Avatar` 컴포넌트를 재사용하지 않습니다.** `globals.css`의 색상 토큰이 전부 무채색(`oklch(x 0 0)`)이라 브랜드 hue가 없고, `Avatar`는 이미지/이니셜용 슬롯 구조라 장식용 그라데이션 블롭과 맞지 않습니다. 대신 작은 전용 컴포넌트(`ChatOrb`)를 만들고, Tailwind의 생생한 색상 유틸(`from-violet-500 via-fuchsia-400 to-amber-300` 등)을 직접 사용합니다.
- **framer-motion 등 신규 의존성 추가 없음.** `dialog.tsx`가 쓰는 `tailwindcss-animate`/`tw-animate-css` 기반 `animate-in`/`animate-out` 클래스를 그대로 재사용합니다.
- **상태 관리는 Recoil/Context 없이 로컬 `useState`만** 사용합니다. 버튼과 패널이 하나의 부모(`FloatingChatWidget`) 아래 형제 컴포넌트이므로 props 2~3개 내려주는 것으로 충분합니다.

## 새로 만들 파일

**공용 UI 프리미티브** (다른 기능에서도 재사용 가능하므로 `ui/`에 위치):
- `src/components/ui/popover.tsx` — `dialog.tsx`를 그대로 본떠 Base UI `Popover`를 래핑 (`Popover`, `PopoverTrigger`, `PopoverPortal`, `PopoverPositioner`, `PopoverPopup`, `PopoverClose` export)

**위젯 전용 컴포넌트** (향후 패키지 추출을 염두에 두고 격리된 디렉터리):
- `src/components/widget/types.ts` — `ChatRole`, `ChatMessage` 타입
- `src/components/widget/ChatOrb.tsx` — 그라데이션 원형 블롭, `size` prop으로 트리거(작게)/패널(크게) 양쪽에서 재사용
- `src/components/widget/ChatWidgetButton.tsx` — `fixed bottom-6 right-6 z-50` 래퍼 + `PopoverTrigger` + 알약형 `Button`(오브 + "채팅하기" 라벨)
- `src/components/widget/ChatMessageBubble.tsx` — user(우측 정렬, `bg-primary`)/assistant(좌측 정렬, `bg-muted`) 버블 렌더링
- `src/components/widget/ChatMessageList.tsx` — 스크롤 가능한 메시지 목록, 메시지 없을 때는 큰 `ChatOrb` + 설명 문구를 보여주는 empty state, 새 메시지 오면 자동 스크롤
- `src/components/widget/ChatInputBar.tsx` — `Input`(기존 `src/components/ui/input.tsx` 재사용, `rounded-full`로 오버라이드) + 원형 전송 버튼(`lucide-react`의 `Send`), `form onSubmit`으로 Enter 전송 지원
- `src/components/widget/ChatWidgetPanel.tsx` — `PopoverPortal` → `PopoverPositioner`(`side="top" align="end" sideOffset={12} positionMethod="fixed"`) → `PopoverPopup`(`w-[380px] max-h-[min(600px,calc(100vh-6rem))] rounded-3xl border bg-card shadow-xl`), 헤더(닫기 버튼 1개만 — "최소화"와 "닫기"를 별도로 둘 이유가 없어 단순화) + `ChatMessageList` + `ChatInputBar`
- `src/components/widget/FloatingChatWidget.tsx` — `"use client"`, `open`/`messages`/`draft` state 소유, 전송 시 사용자 메시지 추가 후 600ms 딜레이로 고정 안내 문구("아직 실제 응답 기능은 연결되어 있지 않아요. UI 데모입니다." 등)를 assistant 메시지로 추가 — 한쪽만 쌓이는 어색함을 피하되 실제 API 호출/새 라우트는 만들지 않음
- `src/components/widget/index.ts` — `FloatingChatWidget`만 공개 export (내부 구현은 숨겨 추출 경계를 깔끔하게 유지)

## 수정할 파일

- `src/app/layout.tsx` — `AuthProvider` 내부, `{children}` 다음에 `<FloatingChatWidget />` 추가. 위젯이 Auth/Recoil에 의존하지 않으므로 위치 자체는 기능적으로 중요하지 않지만, 최소 diff를 위해 이 위치를 사용합니다.

## 시각 스펙 요약

- 트리거: `Button variant="default"`(= `bg-primary text-primary-foreground`, 라이트/다크 모두 자연스러운 진한 알약) 기반, `rounded-full h-12 px-4 gap-2 shadow-lg`, 내부에 `size-7` 오브 + "채팅하기" 텍스트
- 패널: `rounded-3xl border bg-card shadow-xl`, 너비 380px 고정, 높이는 최대 600px(뷰포트에 맞춰 축소)
- 빈 상태: 96px 오브 + "무엇이든 물어보세요" 한 줄 설명
- 메시지 버블: user `ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-sm`, assistant `mr-auto bg-muted text-foreground rounded-2xl rounded-bl-sm`
- 입력창: `rounded-full` input + 우측 안쪽 원형 전송 버튼, placeholder "메시지를 입력하세요..."
- 트랜지션: `dialog.tsx`의 `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100`를 `PopoverPopup`에 그대로 적용

## 검증 방법

이 레포에는 테스트가 전혀 없으므로(`*.test.*` 없음) 수동 검증만 진행합니다.
1. `yarn dev` 실행 후 아무 페이지(로그인 페이지, 대시보드 등) 접속
2. 우하단에 알약형 버튼이 뜨는지, 페이지를 스크롤해도 같은 위치에 고정되어 있는지 확인
3. 버튼 클릭 → 버튼 위쪽으로 카드가 페이드/줌 애니메이션과 함께 열리는지, 빈 상태 오브+설명이 보이는지 확인
4. 메시지 입력 후 Enter 또는 전송 버튼 클릭 → 사용자 말풍선이 우측에, 약 0.6초 뒤 안내 말풍선이 좌측에 뜨는지, 목록이 자동 스크롤되는지 확인
5. 닫기(X) 버튼, ESC 키, 패널 바깥 클릭 각각으로 패널이 닫히는지 확인
6. 다시 열었을 때 이전 메시지 내역이 유지되는지 확인 (상태가 `FloatingChatWidget`에 상주하므로 정상 동작)
