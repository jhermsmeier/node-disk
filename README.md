
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

```javascript
> console.log( hdd )
{
  path: '\\\\.\\PhysicalDrive0',
  MBR: {
    partitions: [{
      status: <Buffer 00>,
      type: <Buffer ee>,
      firstCHS: <Buffer fe ff ff>,
      lastCHS: <Buffer fe ff ff>,
      LBA: 1,
      sectors: 409639
    }, {
      status: <Buffer 00>,
      type: <Buffer af>,
      firstCHS: <Buffer fe ff ff>,
      lastCHS: <Buffer fe ff ff>,
      LBA: 409640,
      sectors: 52734376
    }, {
      status: <Buffer 00>,
      type: <Buffer ab>,
      firstCHS: <Buffer fe ff ff>,
      lastCHS: <Buffer fe ff ff>,
      LBA: 53144016,
      sectors: 1269536
    }, {
      status: <Buffer 80>,
      type: <Buffer 07>,
      firstCHS: <Buffer fe ff ff>,
      lastCHS: <Buffer fe ff ff>,
      LBA: 54415360,
      sectors: 182560768
    }]
  },
  GPT: {
    header: {
      revision: <Buffer 00 00 01 00>,
      headerSize: 92,
      CRC32: <Buffer c7 14 c6 99>,
      currentLBA: <Buffer 01 00 00 00 00 00 00 00>,
      backupLBA: <Buffer ff ff 1f 0e 00 00 00 00>,
      GUID: {
        bytes: <Buffer 86 0c 0b 57 0e 7c 0d 4c a2 56 cb 35 24 ac 43 69>,
        string: '570B0C86-7C0E-4C0D-A256-CB3524AC4369'
      },
      partitionTableLBA: 2,
      partitionEntryCount: 128,
      partitionEntrySize: 128,
      partitionTableCRC32: <Buffer 2c 04 4b 65>
    },
    partitions: [{
      GUID: 'C32C0120-B185-45D6-8840-17E25512232C',
      type: 'C12A7328-F81F-11D2-BA4B-00A0C93EC93B',
      name: <Buffer 45 00 46 00 49 00 20 00 53 00 79 00 73 00 74 00 65 00 6d 00 20 00 50 00 61 00 72 00 74 00 69 00 74 00 69 00 6f 00 6e 00 00 00 00 00 00 00 00 00 00 00 00...>,
      attributes: <Buffer 00 00 00 00 00 00 00 00>,
      firstLBA: <Buffer 28 00 00 00 00 00 00 00>,
      lastLBA: <Buffer 27 40 06 00 00 00 00 00>
    }, {
      GUID: '0BAC4220-A766-4D48-A4EB-FFD8BC9DACA1',
      type: '48465300-0000-11AA-AA11-00306543ECAC',
      name: <Buffer 53 00 79 00 73 00 74 00 65 00 6d 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00...>,
      attributes: <Buffer 00 00 00 00 00 00 00 00>,
      firstLBA: <Buffer 28 40 06 00 00 00 00 00>,
      lastLBA: <Buffer cf e9 2a 03 00 00 00 00>
    }, {
      GUID: '5CD98B53-D17B-4F67-9297-9D19DAE91E37',
      type: '426F6F74-0000-11AA-AA11-00306543ECAC',
      name: <Buffer 52 00 65 00 63 00 6f 00 76 00 65 00 72 00 79 00 20 00 48 00 44 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00...>,
      attributes: <Buffer 00 00 00 00 00 00 00 00>,
      firstLBA: <Buffer d0 e9 2a 03 00 00 00 00>,
      lastLBA: <Buffer ef 48 3e 03 00 00 00 00>
    }, {
      GUID: '4EB6A87B-269C-4A66-AE60-97EFB83E2DC8',
      type: 'EBD0A0A2-B9E5-4433-87C0-68B6B72699C7',
      name: <Buffer 42 00 4f 00 4f 00 54 00 43 00 41 00 4d 00 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00...>,
      attributes: <Buffer 00 00 00 00 00 00 00 00>,
      firstLBA: <Buffer 00 50 3e 03 00 00 00 00>,
      lastLBA: <Buffer ff f7 1f 0e 00 00 00 00>
    }]
  }
}
```
