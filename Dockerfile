FROM node:22-alpine AS builder

RUN addgroup -S periyaruniversity && adduser -S periyaruniversity -G periyaruniversity

WORKDIR /home/periyaruniversity/admin

COPY . .

RUN npm update -g npm

RUN chown -R periyaruniversity:periyaruniversity /home/periyaruniversity/admin

USER periyaruniversity

RUN npm install --legacy-peer-deps

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /home/periyaruniversity/admin/dist /usr/share/nginx/html

RUN mv /usr/share/nginx/html/00-realip.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]