
# Disk [![NPM version](https://badge.fury.io/js/disk.png)](https://npmjs.org/disk)

A node library for reading [GUID Partition Tables], [Master Boot Records] and [Volume Boot Records] raw & straight from the disk.

[GUID Partition Tables]: https://en.wikipedia.org/wiki/GUID_Partition_Table
[Master Boot Records]: https://en.wikipedia.org/wiki/Master_Boot_Record
[Volume Boot Records]: https://en.wikipedia.org/wiki/Volume_Boot_Record



## Install with [npm](https://npmjs.org)

```
npm install disk
```



## Usage

```javascript
var disk = require( 'disk' )
```

```javascript
// Windows
var hdd = disk.load( '\\\\.\\PhysicalDrive0' )
// Mac OS X, Linux, ...
var hdd = disk.load( '/dev/sda' )
```
