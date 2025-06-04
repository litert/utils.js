#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

cd $SCRIPT_ROOT/..

API_DOC_OUTPUT_DIR=tmp
SRC_DIR=src/lib

if [[ -n $(git status --porcelain packages) ]]; then
    echo "Error: You have unstaged changes. Please commit or stash them before generating API docs."
    exit 1
fi

rm $(find packages -name '*.test.ts' -type f)

rm -rf $API_DOC_OUTPUT_DIR

mkdir -p $API_DOC_OUTPUT_DIR

for i in $(ls packages/partials); do
    PKG_DIR_PATH=packages/partials/$i
    if [[ ! -d "$PKG_DIR_PATH" ]]; then
        continue;
    fi

    echo "Generating API docs for '@litert/utils-$i'..."

    if [[ "$i" == "ts-types" ]]; then
        continue;  # Skip ts-types as it does not have API docs
    fi

    npx typedoc \
        --tsconfig ./tsconfig.base.json \
        --out ./tmp/$i \
        --readme none \
        --name "Documents for @litert/utils-$i" \
        --sourceLinkTemplate "https://github.com/litert/utils.js/blob/master/{path}#L{line}" \
        $PKG_DIR_PATH/src/Functions/*.ts \
        $PKG_DIR_PATH/src/Classes/*.ts
done

npx typedoc \
    --tsconfig ./tsconfig.base.json \
    --out ./tmp/ts-types \
    --readme none \
    --name "Documents for @litert/utils-ts-types" \
    --sourceLinkTemplate "https://github.com/litert/utils.js/blob/master/{path}#L{line}" \
    packages/partials/ts-types/src/index.ts

cd $API_DOC_OUTPUT_DIR

tar -zcf $SCRIPT_ROOT/../api-docs.tgz *
rm -rf *

mv $SCRIPT_ROOT/../api-docs.tgz ./

cd $SCRIPT_ROOT/..

git checkout packages
