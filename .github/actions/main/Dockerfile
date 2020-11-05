FROM node:15.1.0-alpine

RUN apk --no-cache add --update \
  git \
  bash \
  jq

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]