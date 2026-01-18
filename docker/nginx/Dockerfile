FROM nginx:alpine

# Nginx 설정 파일 제거
RUN rm /etc/nginx/conf.d/default.conf

# 커스텀 설정 복사는 docker-compose에서 볼륨으로 처리

# 포트 노출
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
