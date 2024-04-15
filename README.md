# discord-notification-ts

![fastify](https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg)
![Orefinger](https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png)


# [방송알리미](https://orefinger.click) API 서비스 (Backend)

서비스 운용
- AWS ECS
- NLB
- RDS
- Route 53
- EC2 (Redis / )

배포환경
- gitaction
- code Pipline (AWS)
- ECR (AWS Elastic Container Registry)

주기능
- Rest API (Fastify)
- Task (Subprocess)
  - youtube
  - chzzk
  - afreeca
  - laftel
- ~~Twitch EventSub~~
  - ~~POST\] /twitch/event~~
  - ~~POST\] /event/twitch~~
- Discord Interaction Event
  - POST\] /bot

오픈 API
- GET] /main/user/{userId}
  - 사용자 정보 조회 (연동정보 조회)


## 커밋 메시지 컨벤션 💬
- Feat : 새로운 기능 추가
- Fix : 버그 수정
- Docs : 문서 수정
- Style : 코드 포맷팅, 세미콜론 등의 스타일 수정(코드 자체 수정 X)
- Refactor : 프로덕션 코드 리팩토링
- Test : 테스트 코드, 테스트 코드 리팩토링


## Plugin
### 라이브러리
- cors - 웹 차단
- jwt - jwt 토큰
- multipart - 파일 업로드
- ratelimit - 레이트 리밋
- swagger  - swagger 문서 제작
### 제작(커스텀)
- ~~eventsub - twitch 이벤트 수신~~
- discord - interaction 이벤트
  - 인터렉션 이벤트 처리
  - 인증

## 이슈 트래킹


# 지원 플렛폼
<img src="https://cdn.orefinger.click/upload/466950273928134666/557750f3-8109-473a-8c52-fce47fe215d8.png" width="20%" height="auto">
<img src="https://cdn.orefinger.click/upload/466950273928134666/50a2f3e9-8281-4d8a-bf05-9a3d626cc2a4.jpg" width="20%" height="auto">
<img src="https://cdn.orefinger.click/post/466950273928134666/042375ef-c2d6-4b00-83b7-7353239b78de.png" width="20%" height="auto">
<img src="https://cdn.orefinger.click/upload/466950273928134666/eb6334d6-2be1-4755-a8e5-b438391d9e1d.png" width="20%" height="auto">