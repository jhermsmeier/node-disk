# Disk
[![npm](http://img.shields.io/npm/v/disk.svg?style=flat)](https://npmjs.org/disk)
[![npm downloads](http://img.shields.io/npm/dm/disk.svg?style=flat)](https://npmjs.org/disk)
[![build status](http://img.shields.io/travis/jhermsmeier/node-disk.svg?style=flat)](https://travis-ci.org/jhermsmeier/node-disk)

A node library for reading [GUID Partition Tables], [Master Boot Records] and [Volume Boot Records] raw & straight from the disk.

Please note that this is experimental stuff. It might not work as expected or work at all with your storage devices and/or might not detect the GPT/MBR/VBR properly or at all. In that case, please file a bug.

[GUID Partition Tables]: https://en.wikipedia.org/wiki/GUID_Partition_Table
[Master Boot Records]: https://en.wikipedia.org/wiki/Master_Boot_Record
[Volume Boot Records]: https://en.wikipedia.org/wiki/Volume_Boot_Record


## ATTENTION:
**DO NOT** trust LBA (Logical Block Address) values over 2^53,
because - you know - JavaScript and 64 bit Integers.


## Install with [npm](https://npmjs.org)

```
npm install disk
```


## Modules

- [mbr](https://github.com/jhermsmeier/node-mbr) for parsing / creating Master Boot Records
- [gpt](https://github.com/jhermsmeier/node-gpt) for parsing / creating GUID Partition Tables


## Usage

```javascript
var Disk = require( 'disk' )
```
