#!/bin/sh -l

yarn
yarn build
yarn test
yarn semantic-release
