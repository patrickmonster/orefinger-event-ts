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
- **GitHub Actions** - CI/CD 파이프라인
- **AWS CodePipeline** - 배포 자동화
- **ECR** - 컨테이너 레지스트리

## 🚀 주요 기능

### API 엔드포인트
- **Discord Interaction Event**
  - `POST /bot` - Discord 봇 인터랙션 처리
- **사용자 API**
  - `GET /main/user/{userId}` - 사용자 정보 및 연동정보 조회


## 🔧 기술 스택

### 플러그인 & 라이브러리
- **cors** - CORS 정책 관리
- **jwt** - JWT 토큰 인증
- **multipart** - 파일 업로드 처리
- **ratelimit** - API 요청 제한
- **swagger** - API 문서 자동 생성

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
  <img src="https://cdn.orefinger.click/upload/466950273928134666/50a2f3e9-8281-4d8a-bf05-9a3d626cc2a4.jpg" width="20%" height="auto">
  <img src="https://cdn.orefinger.click/post/466950273928134666/042375ef-c2d6-4b00-83b7-7353239b78de.png" width="20%" height="auto">
  <img src="https://cdn.orefinger.click/upload/466950273928134666/eb6334d6-2be1-4755-a8e5-b438391d9e1d.png" width="20%" height="auto">
</div>

## 🛠️ 개발 환경

### 요구사항
- Node.js 18+
- TypeScript
- Docker

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Docker 실행
docker build -t broadcast-notifier .
docker run -p 3000:3000 broadcast-notifier
```

## 📄 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.