#!/bin/sh -l

yarn
yarn build
yarn test
yarn codecov
yarn semantic-release
