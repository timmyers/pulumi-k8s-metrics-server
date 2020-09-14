FROM node:14.10.1-alpine

RUN apk --no-cache add --update \
  git \
  bash \
  jq

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]