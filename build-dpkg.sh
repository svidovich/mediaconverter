#!/usr/bin/env bash
# Run this script at the top of the repository to build a dpkg!
# works for intel x86 64 bit machines.
[ -z `which electron-packager` ] && echo "electron-packager not installed! Cannot continue." && exit 1
[ -z `which electron-installer-debian` ] && echo "electron-installer-debian not installed! Cannot continue." && exit 1
[ ! -d node_modules ] && echo "Required packages not installed; installing now." && npm install --save .
mkdir -pv installers
electron-packager . mediaconverter --platform=linux --arch=x64 --overwrite && \
electron-installer-debian --src mediaconverter-linux-x64 --dest installers/ --arch amd64 && \
rm -rf mediaconverter-linux-x64
