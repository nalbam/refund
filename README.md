# AWSKRUG 환불 신청 시스템

AWSKRUG 밋업 참가자들이 참가비 환불을 신청할 수 있는 웹 애플리케이션입니다.

## 기능

- 소모임 선택
- 환불 신청자 정보 입력 (이름, 소속, 이메일, 휴대폰번호)
- Slack 채널로 환불 신청 알림 전송

## 기술 스택

- Next.js 16
- TypeScript
- Tailwind CSS
- Slack Web API

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 입력합니다:

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:

```env
# Slack Bot Token
SLACK_BOT_TOKEN=xoxb-your-token-here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## Slack 설정

1. Slack App을 생성하고 Bot Token을 발급받습니다
2. Bot에 `chat:write` 권한을 부여합니다
3. Bot을 환불 알림을 받을 채널에 초대합니다
4. Bot Token을 `.env` 파일의 `SLACK_BOT_TOKEN`에 설정합니다

## 소모임 설정

소모임 정보는 `lib/config.ts` 파일의 `SUBGROUPS` 상수 배열에 정의되어 있습니다.

새로운 소모임을 추가하려면 `lib/config.ts` 파일을 수정하세요:

```typescript
export const SUBGROUPS: Subgroup[] = [
  {
    id: 'aiengineering',
    name: 'AIEngineering 소모임',
    channelId: 'C07JVMT255E',
  },
  {
    id: 'sandbox',
    name: 'Sandbox 소모임',
    channelId: 'C3Q23GRK7',
  },
  // 새 소모임 추가...
];
```

## 사용 방법

1. 웹사이트 접속
2. 소모임 선택
3. 신청자 정보 입력
   - 이름
   - 소속
   - 이메일
   - 휴대폰번호 (010-0000-0000 형식)
4. "환불 신청" 버튼 클릭
5. 해당 소모임의 Slack 채널로 환불 신청 알림이 전송됩니다

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
