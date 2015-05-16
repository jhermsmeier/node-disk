# Disk
[![npm](http://img.shields.io/npm/v/disk.svg?style=flat-square)](https://npmjs.com/disk)
[![npm downloads](http://img.shields.io/npm/dm/disk.svg?style=flat-square)](https://npmjs.com/disk)
[![build status](http://img.shields.io/travis/jhermsmeier/node-disk.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-disk)

## Install via [npm](https://npmjs.com)

```sh
$ npm install disk
```

## Usage

```js
var Disk = require( 'disk' )
```

Set up a device to work with. This can be anything with a [blockdevice](https://github.com/jhermsmeier/node-blockdevice) compatible API.
```js
var device = new BlockDevice({
  path: BlockDevice.getPath( 0 )
})
```

```js
var disk = new Disk( device )
```

```js
disk.open( function( error ) {
  // Opens a handle to the device and attempts
  // to detect it's block size if unspecified,
  // as well as reading the MBR & GPT on the device
})
```

```js
disk.readMBR( function( error, mbr ) {
  // ...
})
```

```js
disk.writeMBR( function( error ) {
  // ...
})
```

```js
disk.readGPT( function( error, gpt ) {
  // ...
})
```

```js
disk.close( function( error ) {
  // Closes the handle to the device
})
```

## API

#### Disk

- Disk.MBR: See [mbr](https://github.com/jhermsmeier/node-mbr)
- Disk.GPT: See [gpt](https://github.com/jhermsmeier/node-gpt)

#### new Disk( device )

**Properties:**

- **device**
- **mbr**
- **gpt**

**Methods:**

- **open( callback )**
- **close( callback )**
- **getEFIPart()**
- **readMBR( callback )**
- **writeMBR( callback )**
- **readGPT( callback )**
- **writeGPT( callback )**: Not implemented
