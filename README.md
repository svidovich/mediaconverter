# mediaconverter 1.0.0
This is a simple electron app that converts audio files between different formats for you. You drag and drop ( or select singly ) files, and it converts them. It looks shady, but it's very simple. Give it to grandma!

Supported output types:

- mp3
- FLAC
- ogg
- WAV

>"Hey, this works on my WMA files!"

- @nickvido

## Getting started

You should be able to start the application easily by following these steps (debian):

From the top of the repository,

```
# apt install npm
$ npm init
$ npm install --save-dev electron
$ npm install --save .
$ npm start
```

The application should start and you'll be able to test it out.


## Packaging

You can package for Debian or for Windows using the included scripts. 

To package for Debian, from the top of the repository,

```
$ ./build-dpkg.sh
```

To package for Windows, from the top of the repository,

```
# apt install wine wine-development
$ ./build-windows.sh
```

## TODOs

- Installer script for packing rpms
- Multiple file convert dragitude
- More supported output types
