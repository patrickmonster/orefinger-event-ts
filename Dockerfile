# 멀티 스테이지 빌드를 사용하여 이미지 크기 최적화
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사
COPY package*.json ./

# 의존성 설치 (빌드에 필요한 devDependencies 포함)
RUN npm install && npm cache clean --force

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 운영 환경용 이미지
FROM node:20-alpine AS production

# 필요한 시스템 패키지 설치 (canvas 빌드에 필요한 패키지 포함)
RUN apk add --no-cache \
    dumb-init \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# package.json 먼저 복사하여 운영용 의존성 설치
COPY --chown=appuser:nodejs package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# 빌드 단계에서 생성된 파일들 복사
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

# 소스에서 직접 필요한 파일들 복사
# COPY --chown=appuser:nodejs src/static ./dist/static

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 포트 노출
EXPOSE 3000

# non-root 사용자로 전환
USER appuser

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# 애플리케이션 실행
CMD ["dumb-init", "node", "dist/app.js"]
