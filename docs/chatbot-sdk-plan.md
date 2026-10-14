# 챗봇 SDK 외부 공개 배포 계획

> 2026-10-14 논의 내용 정리. 실제 구현 시 이 문서를 참고.

## 목표

챗봇 기능을 SDK 형태로 만들어 서드파티 라이브러리처럼 외부에 공개 배포한다.

## 확정된 결정 사항

- **형태**: 헤드리스 SDK를 먼저 만들고, 그 위에 위젯(UI) 패키지를 구축한다.
- **배포 언어/플랫폼**: JavaScript/TypeScript만, npm으로 배포한다. (다국어 SDK는 현재 계획에 없음)

## 추천 아키텍처 (3계층)

```
[고객 앱] → @yourorg/chatbot-sdk (헤드리스, npm)
              └─ @yourorg/chatbot-widget (UI, 헤드리스 위에 구축, npm)
                      ↓ HTTPS/SSE
          [자체 백엔드 프록시 서버]  ← ANTHROPIC_API_KEY는 여기에만 존재
                      ↓
                 Claude API
```

### 1. 백엔드 프록시 서버 (직접 운영 필요)

- `ANTHROPIC_API_KEY`를 서버 환경변수로만 보관하고, 이 서버에서만 Claude Messages API를 호출한다.
- 시스템 프롬프트, 비즈니스 로직, 대화(세션) 히스토리 관리를 담당한다.
- SDK 사용자(고객)에게는 **자체 발급 API 키**로 인증시키고, 고객별 사용량/과금/레이트리밋을 적용한다.
- 스트리밍 응답(SSE 등)을 클라이언트로 그대로 중계한다.

### 2. 헤드리스 SDK 패키지 (`@yourorg/chatbot-sdk`)

- Claude를 직접 호출하지 않고, 반드시 자체 백엔드 프록시만 호출한다.
- `new ChatbotClient({ apiKey })`, `client.messages.stream(...)` 형태의 깔끔한 인터페이스 제공.
- 스트리밍(비동기 이터레이터), 세션/대화 상태 관리, 타입드 에러, 재시도 로직 포함.

### 3. 위젯 패키지 (`@yourorg/chatbot-widget`)

- 헤드리스 SDK에 의존.
- `<script>` 태그 또는 React 컴포넌트 형태로 드롭인 채팅 UI 제공.

## 핵심 원칙

**공개 배포되는 SDK/위젯 코드 안에는 Anthropic API 키를 절대 넣지 않는다.** npm에 배포된 코드는 누구나 볼 수 있으므로, 키는 반드시 백엔드 프록시 서버에만 존재해야 한다. 이는 내부용 SDK가 아니라 외부 공개 SDK이기 때문에 타협 불가능한 요구사항이다.

## 아직 정하지 않은 사항 (구현 시 결정 필요)

- 모노레포 도구 선택 (예: pnpm + Turborepo로 backend / sdk / widget 패키지 분리)
- 백엔드 API 엔드포인트 설계: 인증 방식, 스트리밍 프로토콜 (SSE 가정 중)
- 세션/대화 히스토리 저장 방식 (DB, in-memory, Redis 등)
