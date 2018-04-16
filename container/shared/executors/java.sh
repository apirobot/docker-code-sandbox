#!/bin/bash
javac "$1"
cd "${1::-9}"
for classfile in *.class; do
    java ${classfile::-6}
done

