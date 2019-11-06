#!/bin/sh -l

NEW_VERSION=`curl https://api.github.com/repositories/92132038/releases | jq -r '.[0].tag_name'`
sed -i -e 's/const metricsServerImageTag = '\'.\*\'';/const metricsServerImageTag = '\'$NEW_VERSION\'';/' src/index.ts
echo ::set-output name=new_version::$NEW_VERSION
