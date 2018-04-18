#!/bin/bash
javac "$1"

cd "$(dirname "${1}")"
for classfile in *.class; do
    java ${classfile::-6}
done
