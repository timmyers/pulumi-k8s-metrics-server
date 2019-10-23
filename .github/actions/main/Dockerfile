FROM node:13.0.0-alpine

RUN apk --no-cache add --update \
  git \
  bash \
  jq

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]