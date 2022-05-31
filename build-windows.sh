#!/usr/bin/env bash
# Run this script at the top of the repository to build a windows executable!
# works for intel x86 64 bit machines.
[ -z `which electron-packager` ] && echo "electron-packager not installed! Cannot continue." && exit 1
[ -z `which electron-installer-windows` ] && echo "electron-installer-windows not installed! Cannot continue." && exit 1
[ ! -d node_modules ] && echo "Required packages not installed; installing now." && npm install --save .
mkdir -pv installers
echo "Packaging for Windows. If your Wine install is outdated, this may take a while. If you don't have Wine, this won't work at all."
electron-packager . mediaconverter --platform win32 --arch x64 --overwrite 
# rm -rf mediaconverter-win32-x64
