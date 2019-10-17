FROM node:12.12.0-alpine

RUN apk --no-cache add --update \
  jq=1.6-r0

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]