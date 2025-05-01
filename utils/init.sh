#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)
cd $SCRIPT_ROOT/..

# check if is windows

if [ ! -z "$(uname -s | grep -E 'MINGW[0-9]{2}_NT')" ]; then
  echo "Windows detected"
  export MSYS=winsymlinks:nativestrict # enable symlink on Windows
fi

npx husky && npx ottoia bootstrap --no-install
