#!/bin/sh -l

NEW_VERSION=`curl https://api.github.com/repos/kubernetes-incubator/metrics-server/releases | jq -r '.[0].tag_name'`
sed -i -e 's/const metricsServerImageTag = '\'.\*\'';/const metricsServerImageTag = '\'$NEW_VERSION\'';/' src/index.ts
echo ::set-env name=METRICS_SERVER_NEW_VERSION::$NEW_VERSION