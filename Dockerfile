#Dockerfile

FROM node:20-alpine

WORKDIR /usr/src/app

# curl 모듈 설치
RUN apk --no-cache add curl
RUN apk --update --no-cache add \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

# 패키지 설치
COPY *.json ./
RUN npm i --force -g tsc tsc-alias typescript yarn 
RUN npm install --force 


COPY . .

# 포트 포워딩
EXPOSE 3000

# 환경변수 설정
ENV FASTIFY_ADDRESS ::
ENV PORT 3000

# 컨테이너 실행 시 실행할 명령어
CMD ["yarn", "start"]

# 테스트
# HEALTHCHECK --interval=1m --timeout=3s CMD curl -f http://0.0.0.0:3000/ping