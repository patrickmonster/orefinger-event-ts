# discord-notification-ts

# [방송알리미](https://orefinger.click) API 서비스

서비스 운용
- AWS ECS
- NLB
- RDS
- Route 53
- EC2 (Redis)

배포환경
- gitaction
- code Pipline (AWS)
- ECR (AWS Elastic Container Registry)

주기능
- Rest API (Fastify)
- Twitch EventSub
  - POST\] /twitch/event
  - POST\] /event/twitch
- Discord Interaction Event
  - POST\] /api/admin/bot


배포전략
- 이미지 첨부

## 커밋 메시지 컨벤션 💬
- Feat : 새로운 기능 추가
- Fix : 버그 수정
- Hotfix : 급하게 치명적인 버그 수정
- Docs : 문서 수정
- Style : 코드 포맷팅, 세미콜론 등의 스타일 수정(코드 자체 수정 X)
- Refactor : 프로덕션 코드 리팩토링
- Test : 테스트 코드, 테스트 코드 리팩토링
- Chore : 빌드 과정 또는 보조 기능(문서 생성 기능 등) 수정
- Rename : 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- Remove : 파일을 삭제하는 작업만 수행한 경우
- Comment : 필요한 주석 추가 및 변경
## 특수성 메세지 컨벤션 💬
- Dev. 개발배포 (develop 브런치)

