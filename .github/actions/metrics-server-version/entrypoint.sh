#!/bin/sh -l

export NEW_VERSION=`curl https://api.github.com/repos/kubernetes-incubator/metrics-server/releases | jq -r '.[0].tag_name'`
sed -ie 's/const metricsServerImageTag = '\'.\*\'';/const metricsServerImageTag = '\'$NEW_VERSION\'';/' src/index.ts
rm src/index.tse || true
