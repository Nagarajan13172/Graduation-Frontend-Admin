FROM node:22-alpine AS builder

RUN addgroup -S periyaruniversity && adduser -S periyaruniversity -G periyaruniversity

WORKDIR /home/periyaruniversity/admin

RUN chown -R periyaruniversity:periyaruniversity /home/periyaruniversity/admin/

RUN npm update -g npm

USER periyaruniversity

COPY --chown=periyaruniversity:periyaruniversity package*.json /home/periyaruniversity/admin/

RUN npm install --legacy-peer-deps

COPY --chown=periyaruniversity:periyaruniversity . .

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /home/periyaruniversity/admin/dist /usr/share/nginx/html/

RUN mv /usr/share/nginx/html/00-realip.conf /etc/nginx/conf.d/ 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]