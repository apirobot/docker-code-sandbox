#!/bin/bash
cd "$(dirname "${1}")"
file="$(basename -- "$1")"
filename="${file%.*}"

if [ ! -f "${filename}.exe" ]
then
    mcs ${file}
fi

mono "${filename}.exe"
