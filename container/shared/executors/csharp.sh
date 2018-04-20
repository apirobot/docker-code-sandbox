#!/bin/bash
cd "$(dirname "${1}")"

file="$(basename -- "$1")"

mcs ${file}
filename="${file%.*}"
mono "${filename}.exe"
