#!/bin/bash

function checkCommand() {
    command -v $1 > /dev/null 2>&1 || { echo >&2 "$1 required but not installed.  Aborting."; exit 1; }
}

checkCommand jq

platforms=(chrome firefox)

for platform in ${platforms[@]}
do
    mkdir -p dist/${platform}

    cp -r src/* dist/${platform}
    cp -r bower_components/jquery/dist/jquery.min.js dist/${platform}
    cp -r bower_components/axios/dist/axios.min.js dist/${platform}
    cp -r bower_components/q/q.js dist/${platform}
done

cat src/manifest.json | jq '.author = "Patrick Connelly <patrick@deadlypenguin.com>"' > dist/firefox/manifest.json