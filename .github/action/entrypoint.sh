#!/bin/sh -l

yarn
yarn build

echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' >> .npmrc
echo 'registry=http://registry.npmjs.org' >> .npmrc

VERSION=`./scripts/get-version` && sed -i.bak "s/\$${VERSION}/$(VERSION)/g" ./package.json
NPM_TAG="dev"

# If the package doesn't have a pre-release tag, use the tag of latest instead of
# dev. NPM uses this tag as the default version to add, so we want it to mean
# the newest released version.
if [[ $(jq -r .version < package.json) != *-* ]]; then
    NPM_TAG="latest"
fi

yarn publish --tag "${NPM_TAG}"
