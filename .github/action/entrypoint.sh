#!/bin/sh -l

yarn
yarn build

echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' >> .npmrc
echo 'registry=http://registry.npmjs.org' >> .npmrc
VERSION=`./scripts/get-version` && yarn publish --access public
