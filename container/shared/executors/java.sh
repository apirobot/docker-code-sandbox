#!/bin/bash
cd "$(dirname "${1}")"
file="$(basename -- "$1")"

if [ ! -f *.class ]
then
    javac "${file}"
fi

for classfile in *.class; do
    java ${classfile%.*}
    exit 0;
done
