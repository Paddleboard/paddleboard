#!/bin/bash
set -eo pipefail

PACKAGE_NAME=$1
NPM_TAG=$2

# set up .npmrc to authenticate with the provided token
echo "Seting up .npmrc ..."
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

echo "Publishing '${NPM_TAG}' to NPM..."
npm publish ${PACKAGE_NAME} --tag=${NPM_TAG} --access public
