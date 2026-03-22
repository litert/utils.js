#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

cd $SCRIPT_ROOT/..

rm -rf docs/website/en

mkdir docs/website/en
cp -r docs/en/ docs/website/en/api

for i in $(find docs/website/en/api -name "README.md"); do
    mv $i ${i/README.md/index.md}
done

for i in $(find docs/website/en/api -name "*.md"); do
    sed -e 's/README.md/index.md/g' -i  $i
    sed -e 's/\[TOC\]//g' -i  $i
done

npm i -D vitepress

if ! npx vitepress build docs/website; then
    npm un -D vitepress
    echo "VitePress build failed. Exiting with error."
    exit 1
fi

npm un -D vitepress

cd $SCRIPT_ROOT/../docs/website/.vitepress/dist

tar -zcf ../html-docs.tgz ./*
