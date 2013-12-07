# Disk [![NPM version](https://badge.fury.io/js/disk.png)](https://npmjs.org/disk) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jhermsmeier/node-disk/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

A node library for reading [GUID Partition Tables], [Master Boot Records] and [Volume Boot Records] raw & straight from the disk.

Please note that this is experimental stuff. It might not work as expected or work at all with your storage devices and/or might not detect the GPT/MBR/VBR properly or at all. In that case, please file a bug.

[GUID Partition Tables]: https://en.wikipedia.org/wiki/GUID_Partition_Table
[Master Boot Records]: https://en.wikipedia.org/wiki/Master_Boot_Record
[Volume Boot Records]: https://en.wikipedia.org/wiki/Volume_Boot_Record


## ATTENTION:
**DO NOT** trust LBA (Logical Block Address) values over 2^32 - 1,
because - you know - JavaScript and 64 bit Integers.


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
      status: 0,
      type: 238,
      info: [{
        description: 'GPT, protective MBR'
      }],
      firstCHS: 65534,
      lastCHS: 65534,
      LBA: 1,
      sectors: 409639,
      volume: [Error: No VBR detected]
    }, {
      status: 0,
      type: 175,
      info: [{
        fs: 'HFS',
        os: 'Mac OS'
      }],
      firstCHS: 65534,
      lastCHS: 65534,
      LBA: 409640,
      sectors: 52734376,
      volume: [Error: No VBR detected]
    }, {
      status: 0,
      type: 171,
      info: [{
        os: 'Mac OS',
        description: 'Apple Boot'
      }],
      firstCHS: 65534,
      lastCHS: 65534,
      LBA: 53144016,
      sectors: 1269536,
      volume: [Error: No VBR detected]
    }, {
      status: 128,
      type: 7,
      info: [
        { fs: 'IFS', os: 'OS/2' },
        { fs: 'HPFS', os: 'OS/2' },
        { fs: 'HPFS', os: 'Windows' },
        { fs: 'NTFS', os: 'Windows' },
        { fs: 'exFAT', os: 'Windows' }
      ],
      firstCHS: 65534,
      lastCHS: 65534,
      LBA: 54415360,
      sectors: 182560768,
      volume: {
        systemName: 'NTFS',
        type: < Buffer f8 > ,
        bytesPerSector: 512,
        sectorsPerCluster: 8,
        clusterSize: 4096,
        numberOfFATs: 0,
        maxEntries: 0,
        sectorsPerFAT: 0,
        sectorsPerTrack: 63,
        headsPerTrack: 255,
        hiddenSectors: 20480,
        reservedSectors: 0,
        sectors: 0
      }
    }]
  },
  GPT: {
    header: {
      revision: < Buffer 00 00 01 00 > ,
      headerSize: 92,
      CRC32: < Buffer e8 01 54 49 > ,
      currentLBA: 1,
      backupLBA: 236978175,
      GUID: '570B0C86-7C0E-4C0D-A256-CB3524AC4369',
      partitionTableLBA: 2,
      partitionEntryCount: 128,
      partitionEntrySize: 128,
      partitionTableCRC32: < Buffer d4 f4 b1 57 >
    },
    partitions: [{
      GUID: 'C32C0120-B185-45D6-8840-17E25512232C',
      type: 'C12A7328-F81F-11D2-BA4B-00A0C93EC93B',
      info: {
        OS: null,
        description: 'EFI System partition'
      },
      name: 'EFI System Partition',
      attributes: < Buffer 00 00 00 00 00 00 00 00 > ,
      firstLBA: 40,
      lastLBA: 409639,
      volume: {
        systemName: 'BSD4.4',
        type: < Buffer f0 > ,
        bytesPerSector: 512,
        sectorsPerCluster: 1,
        clusterSize: 512,
        numberOfFATs: 2,
        maxEntries: 0,
        sectorsPerFAT: 0,
        sectorsPerTrack: 32,
        headsPerTrack: 16,
        hiddenSectors: 0,
        reservedSectors: 32,
        sectors: 16384
      }
    }, {
      GUID: '0BAC4220-A766-4D48-A4EB-FFD8BC9DACA1',
      type: '48465300-0000-11AA-AA11-00306543ECAC',
      info: {
        OS: 'Mac OS X',
        description: 'HFS+ partition'
      },
      name: 'System',
      attributes: < Buffer 00 00 00 00 00 00 00 00 > ,
      firstLBA: 409640,
      lastLBA: 53144015,
      volume: [Error: No VBR detected]
    }, {
      GUID: '5CD98B53-D17B-4F67-9297-9D19DAE91E37',
      type: '426F6F74-0000-11AA-AA11-00306543ECAC',
      info: {
        OS: 'Mac OS X',
        description: 'Apple Boot partition'
      },
      name: 'Recovery HD',
      attributes: < Buffer 00 00 00 00 00 00 02 00 > ,
      firstLBA: 53144016,
      lastLBA: 54413551,
      volume: [Error: No VBR detected]
    }, {
      GUID: '4EB6A87B-269C-4A66-AE60-97EFB83E2DC8',
      type: 'EBD0A0A2-B9E5-4433-87C0-68B6B72699C7',
      info: {
        OS: 'Windows',
        description: 'Basic data partition'
      },
      name: 'BOOTCAMP',
      attributes: < Buffer 00 00 00 00 00 00 00 00 > ,
      firstLBA: 54415360,
      lastLBA: 236976127,
      volume: {
        systemName: 'NTFS',
        type: < Buffer f8 > ,
        bytesPerSector: 512,
        sectorsPerCluster: 8,
        clusterSize: 4096,
        numberOfFATs: 0,
        maxEntries: 0,
        sectorsPerFAT: 0,
        sectorsPerTrack: 63,
        headsPerTrack: 255,
        hiddenSectors: 20480,
        reservedSectors: 0,
        sectors: 0
      }
    }]
  }
}
```
