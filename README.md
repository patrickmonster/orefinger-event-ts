# discord-notification-ts

![fastify](https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg)
![Orefinger](https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png)


# [방송알리미](https://orefinger.click) API 서비스 (Backend)

서비스 운용
- AWS ECS
- NLB
- RDS
- Route 53
- EC2 (Redis)
- S3

배포환경
- gitaction
- code Pipline (AWS)
- ECR (AWS Elastic Container Registry)

주기능
- Rest API (Fastify)
- ~~Task (Subprocess)~~
  - ~~youtube~~
  - ~~chzzk~~
  - ~~afreeca~~
  - ~~laftel~~
- ~~Twitch EventSub~~
  - ~~POST\] /twitch/event~~
  - ~~POST\] /event/twitch~~
- Discord Interaction Event
  - POST\] /bot

오픈 API
- GET] /main/user/{userId}
  - 사용자 정보 조회 (연동정보 조회)


## 커밋 메시지 컨벤션 💬
- Add : 새로운 기능 추가
- Fix : 버그 수정
- ~~Docs : 문서 수정~~
- Init : 초기작업
- ~~Test : 테스트 코드, 테스트 코드 리팩토링~~


## Plugin
### 라이브러리
- cors - 웹 차단
- jwt - 토큰
- multipart - 파일 업로드
- ratelimit - 레이트 리밋
- swagger  - swagger 문서 제작

## 이슈 트래킹
- ~~redis pub/sub server~~
- ~~socket.io (redis-adapter)~~

## 파생된 라이브러리
### [interval-queue](https://www.npmjs.com/package/interval-queue)
 - 배치 로직 작업을 위한 프로세서 루프 관리
 - 프로세서가 상시 중지할 가능성이 있기 때문에 중지 시그널을 받으면, 모든 반복작업을 사전 정리함

### [mysql-rowquery](https://www.npmjs.com/package/mysql-rowquery)
 - mysql 커넥션 관리 라이브러리
 - 로우 쿼리용
 - 연결 관리 자동화

### [fastify-discord](https://www.npmjs.com/package/fastify-discord)
  - discord command 명령어 수신용 (암호화키 처리)
  - fastify 연동 라이브러리



## ~~챗봇~~
- ~~chzzkChat.ts~~
 - ~~치지직 채팅 통신용 봇~~
 - 운 
# 지원 플랫폼
<img src="https://cdn.orefinger.click/upload/466950273928134666/557750f3-8109-473a-8c52-fce47fe215d8.png" width="20%" height="auto">
<img src="https://cdn.orefinger.click/post/466950273928134666/042375ef-c2d6-4b00-83b7-7353239b78de.png" width="20%" height="auto">
<img src="https://cdn.orefinger.click/upload/466950273928134666/eb6334d6-2be1-4755-a8e5-b438391d9e1d.png" width="20%" height="auto">