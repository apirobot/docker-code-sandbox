#!/bin/bash
cd "$(dirname "${1}")"
file="$(basename -- "$1")"

g++ "${file}" -o code
./code
