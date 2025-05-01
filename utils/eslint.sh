#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)
cd $SCRIPT_ROOT/..

npx eslint --ext ts packages/partials/*/src packages/bundle/src
