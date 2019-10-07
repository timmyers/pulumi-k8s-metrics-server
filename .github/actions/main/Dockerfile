FROM node:12.11.0-alpine

RUN apk --no-cache add --update \
  git=2.20.1-r0 \
  bash=4.4.19-r1 \
  jq=1.6-r0

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]