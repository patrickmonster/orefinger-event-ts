# 방송알리미 API 서비스

<div align="center">
  <img src="https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg" width="400" height="auto" alt="Fastify">
  <img src="https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png" width="120" height="auto" alt="Orefinger">
</div>

[방송알리미](https://orefinger.click) 서비스의 백엔드 API 서버입니다.

## 🏗️ 인프라 구조

### 서비스 운용
- **AWS ECS** - 컨테이너 오케스트레이션
- **NLB** - 네트워크 로드 밸런서
- **RDS** - 관계형 데이터베이스
- **Route 53** - DNS 관리
- **EC2 (Redis)** - 캐시 서버

### 배포 환경
- **GitHub Actions** - CI/CD 파이프라인 (Node.js 20.10.0)
- **AWS CodeDeploy** - 자동 배포 시스템
- **AWS S3** - 빌드 아티팩트 저장소
- **Docker** - 컨테이너화된 배포

## 🚀 주요 기능

### Discord 봇 기능
- **인터랙션 처리** - 슬래시 커맨드, 버튼, 메뉴 등
- **자동 역할 부여** - 사용자 인증 및 역할 관리
- **알림 시스템** - 방송 시작/종료 알림
- **임베드 메시지** - 커스텀 임베드 메시지 생성

### 스트리밍 플랫폼 연동
- **트위치** - 스트리밍 상태 모니터링
- **치지직** - 네이버 치지직 방송 알림
- **아프리카TV** - 아프리카TV 방송 알림
- **라프텔** - 라프텔 콘텐츠 알림

### API 엔드포인트
- **Discord Interaction**
  - `POST /bot` - Discord 봇 인터랙션 처리
- **사용자 관리**
  - `GET /main/user/{userId}` - 사용자 정보 및 연동정보 조회
- **인증**
  - `POST /auth/*` - OAuth 인증 처리
- **알림 관리**
  - `GET|POST /notice/*` - 알림 설정 및 관리
- **결제**
  - `POST /payment/*` - 결제 처리 (토스페이먼츠 연동)


## 🔧 기술 스택

### 백엔드 프레임워크
- **Fastify** - 고성능 Node.js 웹 프레임워크
- **TypeScript** - 정적 타입 지원

### 데이터베이스 & 캐시
- **MySQL2** - 관계형 데이터베이스 드라이버
- **Redis (ioredis)** - 인메모리 캐시 및 세션 스토어

### 외부 API 연동
- **Discord API** - Discord 봇 및 인터랙션
- **AWS SDK** - S3, ECS 등 AWS 서비스 연동
- **Twitch API** - 트위치 스트리밍 정보
- **치지직 API** - 네이버 치지직 스트리밍 정보
- **아프리카TV API** - 아프리카TV 스트리밍 정보

### 플러그인 & 라이브러리
- **@fastify/cors** - CORS 정책 관리
- **@fastify/jwt** - JWT 토큰 인증
- **@fastify/multipart** - 파일 업로드 처리
- **@fastify/rate-limit** - API 요청 제한
- **@fastify/swagger** - API 문서 자동 생성
- **@fastify/helmet** - 보안 헤더 설정

### 커스텀 플러그인
- **discord** - Discord 인터랙션 이벤트 처리 및 인증

## 📝 커밋 컨벤션
- **Add** - 새로운 기능 추가
- **Fix** - 버그 수정
- **Docs** - 문서 수정
- **Init** - 초기 작업 
## 🎮 지원 플랫폼

<div align="center">
  <img src="https://cdn.orefinger.click/upload/466950273928134666/557750f3-8109-473a-8c52-fce47fe215d8.png" width="20%" height="auto">
<!--   <img src="https://cdn.orefinger.click/upload/466950273928134666/50a2f3e9-8281-4d8a-bf05-9a3d626cc2a4.jpg" width="20%" height="auto"> -->
  <img src="https://cdn.orefinger.click/post/466950273928134666/042375ef-c2d6-4b00-83b7-7353239b78de.png" width="20%" height="auto">
  <img src="https://cdn.orefinger.click/upload/466950273928134666/eb6334d6-2be1-4755-a8e5-b438391d9e1d.png" width="20%" height="auto">
</div>

## � 프로젝트 구조

```
src/
├── components/          # Discord 컴포넌트 및 UI 요소
├── controllers/         # API 컨트롤러 로직
├── interactions/        # Discord 인터랙션 핸들러
├── interfaces/          # TypeScript 인터페이스 정의
├── plugins/            # Fastify 플러그인
├── routes/             # API 라우트 정의
├── utils/              # 유틸리티 함수 및 헬퍼
└── app.ts              # 애플리케이션 진입점
```

## 🛠️ 개발 환경

### 요구사항
- **Node.js** 20.10.0+
- **TypeScript** 5.1.3+
- **Docker** (선택사항)
- **MySQL** 데이터베이스
- **Redis** 서버

### 환경 변수 설정
```bash
# .env 파일 생성 (환경별로 src/env/.env.{NODE_ENV} 형태)
NODE_ENV=local|dev|prod
PORT=3000
FASTIFY_ADDRESS=::

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# Discord 설정
DISCORD_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_client_id

# AWS 설정 (프로덕션)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 설치 및 실행
```bash
# 의존성 설치
yarn install
# 또는
npm install

# 로컬 개발 서버 실행
yarn local
# 또는
npm run local

# 개발 서버 실행 (파일 변경 감지)
yarn dev
# 또는
npm run dev

# Discord 봇 모드 실행
yarn bot
# 또는
npm run bot

# 프로덕션 빌드
yarn build
# 또는
npm run build

# 프로덕션 서버 실행
yarn start
# 또는
npm start
```

### Docker 실행
```bash
# Docker 이미지 빌드
docker build -t orefinger-api .

# 컨테이너 실행
docker run -p 3000:3000 orefinger-api
```

## � 배포 스프로세스

### 자동 배포
1. `master` 브랜치로 PR 머지 시 자동 배포 시작
2. GitHub Actions에서 Node.js 20.10.0 환경으로 빌드
3. TypeScript 컴파일 및 패키징
4. AWS S3에 빌드 아티팩트 업로드
5. AWS CodeDeploy를 통한 EC2 인스턴스 배포

### 수동 배포
```bash
# 빌드 및 배포 스크립트 실행
yarn build
# 배포 스크립트는 scripts/ 디렉토리에 위치
```

## 📊 모니터링 & 로깅

- **Fastify Logger** - 구조화된 로그 출력
- **AWS CloudWatch** - 로그 수집 및 모니터링
- **Health Check** - `/ping` 엔드포인트를 통한 상태 확인

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add: 새로운 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 문의

- **개발자**: Soung jin Ryu (neocat@kakao.com)
- **서비스**: [방송알리미](https://orefinger.click)
- **저장소**: [GitHub](https://github.com/patrickmonster/discord-notification-ts)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
