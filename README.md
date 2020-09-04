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
