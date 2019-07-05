FROM node:12.5.0-alpine

RUN apk --no-cache add --update \
  git=2.20.1-r0

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]