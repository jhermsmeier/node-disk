var Disk = require( '../' )
var assert = require( 'assert' )

function inspect( object ) {
  process.stdout.write(
    require( 'util' ).inspect( object, {
      colors: true,
      depth: null
    }) + '\n\n'
  )
}

const HDD = '\\\\.\\PhysicalDrive0'
const USB = '\\\\.\\PhysicalDrive1'
const SDC = '\\\\.\\PhysicalDrive2'

var hdd = Disk.fromDevice(
  new Disk.Device( 0 )
)

var disk = Disk.fromDevice(
  new Disk.Device( 1 )
)

// inspect( disk )

// Change type to hybrid GPT
// disk.MBR.partitions[0].type = 0xEE
// disk.device.writeLBA( 0, disk.MBR.buffer )

inspect( disk.GPT )

disk.device.writeLBA( 0, hdd.MBR.buffer )
disk.device.writeLBA( 1, hdd.GPT.buffer )
// disk.device.writeLBA( 1, disk.GPT.buffer )

// NOTE:
// Never forget to unmount the device
// after being done using it, to prevent
// file descriptor leakage
disk.device.unmount()
