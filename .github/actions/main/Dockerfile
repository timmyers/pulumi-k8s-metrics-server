FROM node:16.5.0-alpine

RUN apk --no-cache add --update \
  git \
  bash \
  jq

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]