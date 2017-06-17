# Disk
[![npm](https://img.shields.io/npm/v/disk.svg?style=flat-square)](https://npmjs.com/package/disk)
[![npm license](https://img.shields.io/npm/l/disk.svg?style=flat-square)](https://npmjs.com/package/disk)
[![npm downloads](https://img.shields.io/npm/dm/disk.svg?style=flat-square)](https://npmjs.com/package/disk)
[![build status](https://img.shields.io/travis/jhermsmeier/node-disk.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-disk)

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save disk
```

## Related Modules

**Internals:**

- [MBR](https://github.com/jhermsmeier/node-mbr) – Master Boot Record
- [GPT](https://github.com/jhermsmeier/node-gpt) – GUID Partition Table
- [CHS](https://github.com/jhermsmeier/node-chs) – Cylinder-Head-Sector Addressing
- [apple-partition-map](https://github.com/jhermsmeier/node-apple-partition-map) – Apple Partition Map
- [BlockDevice](https://github.com/jhermsmeier/node-blockdevice) – Block device handling
- [RamDisk](https://github.com/jhermsmeier/node-ramdisk) – In-memory block device

**Block Devices:**

- [VHD](https://github.com/jhermsmeier/node-vhd) – Microsoft Virtual Hard Disk format
- [UDIF](https://github.com/jhermsmeier/node-udif) – Apple's DMG / UDIF (Universal Disk Image Format)
- [UDF](https://github.com/jhermsmeier/node-udf) – OSTA Universal Disk Format

**File Systems:**

- [FAT32](https://github.com/jhermsmeier/node-fat32) – FAT32/16/12 file system driver
- [ExFAT](https://github.com/jhermsmeier/node-exfat) – ExFAT file system driver
- [HFSX](https://github.com/jhermsmeier/node-hsfx) – Apple HFS+ file system driver
- [NTFS](https://github.com/jhermsmeier/node-ntfs) – NTFS file system driver

## Usage

```js
var Disk = require( 'disk' )
```

Set up a device to work with.
This can be anything with a [blockdevice](https://github.com/jhermsmeier/node-blockdevice) compatible API.

```js
var device = new BlockDevice({
  path: BlockDevice.getPath( 0 )
})
```

Create a disk:

```js
var disk = new Disk( device )
```

Open the device:

```js
// This also attempts to detect it's block size if unspecified,
// as well as reading the MBR & GPT on the device
disk.open( function( error ) {})
```

Read or write the MBR (`disk.mbr`) from or to the device:

```js
disk.readMBR( function( error, mbr ) {})
disk.writeMBR( function( error ) {})
```

Read or write the GPT (`disk.gpt`) from or to the device:

```js
disk.readGPT( function( error, gpt ) {})
disk.writeGPT( function( error ) {})
```

Verify the backup GPT;
NOTE: The callback will be called with an error *and*
the backup GPT if it doesn't verify.

```js
disk.verifyGPT( function( error, backupGPT ) {})
```

Close the device:

```js
disk.close( function( error ) {})
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
- **writeGPT( callback )**
- **writeGPT( callback )**: Not implemented
