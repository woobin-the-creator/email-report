# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Build argument로 API URL 받기
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 프로덕션 빌드
RUN npm run build

# Stage 2: Development (선택적)
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 10005

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Production with Nginx
FROM nginx:alpine AS production

# 빌드된 파일을 Nginx html 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사 (옵션)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
