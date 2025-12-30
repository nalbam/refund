# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

AWSKRUG 환불 신청 시스템 - AWSKRUG 밋업 참가자들이 참가비 환불을 신청할 수 있는 Next.js 웹 애플리케이션입니다. 사용자가 환불 신청 정보를 입력하면 선택한 소모임의 Slack 채널로 알림이 전송됩니다.

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 실행
npm run lint
```

## 아키텍처

### 기술 스택
- Next.js 16 (App Router)
- TypeScript (strict mode 활성화)
- Tailwind CSS 4 (스타일링)
- Slack Web API (@slack/web-api) (알림 전송)

### 프로젝트 구조

```
app/
  api/
    refund/route.ts       # 환불 신청 제출 POST 엔드포인트
    subgroups/route.ts    # 사용 가능한 소모임 조회 GET 엔드포인트
  page.tsx                # 메인 환불 신청 폼 페이지 (클라이언트 컴포넌트)
  layout.tsx              # 루트 레이아웃
  globals.css             # 글로벌 스타일
lib/
  config.ts               # 전역 설정 (SUBGROUPS, SLACK_BOT_TOKEN)
  utils.ts                # 공유 유틸리티 함수 (parseSubgroups, sanitizeForSlack)
```

### 데이터 흐름

1. **프론트엔드 (app/page.tsx)**:
   - 클라이언트 컴포넌트가 마운트 시 `/api/subgroups`에서 소모임 목록 조회
   - 사용자가 유효성 검증과 함께 환불 신청 폼 작성
   - 휴대폰번호는 `010-0000-0000` 형식으로 자동 포맷팅
   - 폼 제출 시 `/api/refund`로 POST 요청

2. **백엔드 API 라우트**:
   - `/api/subgroups`: 전역 설정(`lib/config.ts`)에서 소모임 목록 반환
   - `/api/refund`: 요청 유효성 검증 후 해당 채널로 포맷팅된 Slack 메시지 전송
   - 두 라우트 모두 전역 `SUBGROUPS`, `SLACK_BOT_TOKEN` 상수 사용

3. **Slack 연동**:
   - Slack Block Kit을 사용한 풍부한 메시지 포맷팅
   - 메시지 포함 정보: 소모임, 이름, 소속, 이메일, 휴대폰, 신청일시
   - `chat:write` 봇 권한 필요

## 환경 변수 설정

`.env` 파일에 필요한 환경 변수:

```env
# Slack Bot Token (xoxb-...)
SLACK_BOT_TOKEN=xoxb-your-token-here
```

## 소모임 설정 (Constants Configuration)

소모임 정보는 `lib/config.ts` 파일에 상수로 정의되어 있습니다:

```typescript
export const SUBGROUPS: Subgroup[] = [
  {
    id: 'aiengineering',
    name: 'AIEngineering 소모임',
    channelId: 'C07JVMT255E',
  },
  {
    id: 'container',
    name: 'Container 소모임',
    channelId: 'GE94HAW4V',
  },
  {
    id: 'sandbox',
    name: 'Sandbox 소모임',
    channelId: 'C3Q23GRK7',
  },
];
```

### 전역 설정 사용 방법

API 라우트 및 서버 컴포넌트에서 전역 설정을 임포트하여 사용:

```typescript
import { SUBGROUPS, SLACK_BOT_TOKEN } from '@/lib/config';
```

**장점**:
- 환경 변수 파싱 불필요, 타입 안정성 보장
- 설정이 코드에 명시되어 관리 용이
- API 라우트 코드 간소화
- Git으로 버전 관리 가능

**주의사항**:
- 소모임 추가/수정 시 `lib/config.ts` 파일 수정 필요
- 채널 ID는 민감 정보가 아니므로 코드에 포함 가능
- `lib/config.ts`는 서버 컴포넌트/API 라우트에서만 사용 (클라이언트에서 임포트 금지)

## 주요 패턴 및 규칙

### 입력 유효성 검증 및 새니타이징

**클라이언트 측 검증** (app/page.tsx):
- 이메일 정규식: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 휴대폰 정규식: `/^010-\d{4}-\d{4}$/`
- 사용자 입력 시 휴대폰번호 자동 포맷팅

**서버 측 검증** (app/api/refund/route.ts):
- 모든 입력값 재검증 (클라이언트를 신뢰하지 않음)
- 일관성을 위해 동일한 휴대폰 정규식 사용
- 모든 텍스트 입력은 Slack 전송 전 `sanitizeForSlack()` 처리

**Slack 새니타이징** (lib/utils.ts):
- HTML 엔티티 이스케이프: `&`, `<`, `>`
- Slack 마크다운 이스케이프: `*`, `_`, `~`, `` ` ``
- 사용자 생성 콘텐츠의 마크다운 인젝션 공격 방지

### TypeScript 설정

- 경로 별칭: `@/*`는 프로젝트 루트로 매핑
- strict mode 활성화
- JSX: react-jsx (Next.js 16 호환)
- 모듈 해석: bundler

### 에러 처리

- API 라우트는 구조화된 에러 응답 반환: `{ error: string }`
- 서버 측 에러는 콘솔 로깅
- 프론트엔드에서 사용자 친화적인 한국어 에러 메시지 표시
- 모든 API 에러는 적절한 HTTP 상태 코드 포함 (400, 500)

## Slack 설정 체크리스트

새로운 Slack 연동 설정 시:
1. Slack App 생성 및 Bot User 추가
2. `chat:write` OAuth 스코프 추가
3. 워크스페이스에 앱 설치
4. 대상 채널에 봇 초대
5. Bot Token (xoxb-...)을 `.env` 파일의 `SLACK_BOT_TOKEN`에 설정

## 새 소모임 추가하기

`lib/config.ts` 파일의 `SUBGROUPS` 배열에 새 항목 추가:

```typescript
export const SUBGROUPS: Subgroup[] = [
  // 기존 소모임들...
  {
    id: 'new-subgroup',           // 고유 ID (URL 친화적)
    name: '새 소모임',             // 화면에 표시될 이름
    channelId: 'C12345678',       // Slack 채널 ID
  },
];
```

**절차**:
1. Slack 채널 생성 및 채널 ID 확인
2. 채널에 봇 초대
3. `lib/config.ts` 파일 수정
4. 변경사항 커밋 및 배포

## 코드 스타일 규칙

- 사용자 대면 텍스트는 한국어 사용 (UI 레이블, 에러 메시지, Slack 알림)
- 코드는 영어 사용 (변수명, 함수명, 주석)
- Tailwind 유틸리티 클래스로 스타일링 (커스텀 CSS 모듈 미사용)
- 서버/클라이언트 컴포넌트 명확히 분리 (Next.js App Router 패턴)
- 공유 유틸리티는 lib/ 디렉토리로 추출
