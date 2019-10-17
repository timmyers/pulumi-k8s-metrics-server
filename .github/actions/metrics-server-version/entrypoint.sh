#!/bin/sh -l

export NEW_VERSION=`curl https://api.github.com/repos/kubernetes-incubator/metrics-server/releases | jq '.[0].tag_name'`
cat src/index.ts
sed -ie 's/const metricsServerImageTag = '\'.\*\'';/const metricsServerImageTag = '\'$NEW_VERSION\'';/' src/index.ts
cat src/index.ts
