
# socket 내부망

내부망 통신을 위한 유틸 입니다.


사용스텍

- socket.io
- @soclet.io/redis-adpater
- ioredis



## 목적
물리적으로 분리된 서버를 동기화 시키고
해당 서버간 원활한 통신을 위하여,
app 프로세서에서 pub/sub를 통한 통신을 매인으로

하위 프로세서가 내부 sokcet 에서 연결하여 통신을 진행 합니다.



======================================
server 에서 emit 한거만, 모든 채널에 뿌려짐

serverEmit 도 있으나, 이는 서버간 통신에 필요 (클라이언트를 통할때는 server 에서 emit)
