#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

$SCRIPT_ROOT/rm-all-package-node-modules.sh
cd $SCRIPT_ROOT/../

if [ ! -z "$(uname -s | grep -E 'MINGW[0-9]{2}_NT')" ]; then
  echo "Windows detected"
  export MSYS=winsymlinks:nativestrict # enable symlink on Windows
fi

if [[ ! -d "node_modules" ]]; then
    npm ci
else

    npx ottoia bootstrap --no-install
fi
