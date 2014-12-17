var util = require( 'util' )
var assert = require( 'assert' )
var async = require( 'async' )

var BlockDevice = require( '../../node-blockdevice' )
var Disk = require( '../' )
var NTFS = require( '../../node-ntfs' )

var log = console.log.bind( console )
function inspect( label, object ) {
  log( '\n' + label, util.inspect( object, {
    colors: true,
    depth: null
  }))
  log( '' )
}

const HDD = '\\\\.\\PhysicalDrive0'
const USB = '\\\\.\\PhysicalDrive1'
const SDC = '\\\\.\\PhysicalDrive2'

var device = new BlockDevice({
  path: BlockDevice.getPath( 0 )
})

var disk = new Disk( device )
var fs = new NTFS({
  readOnly: true
})

async.waterfall([
  
  function mountDisk( next ) {
    log( '[DISK] mounting...' )
    disk.open( next )
  },
  
  // function detectSize( next ) {
  //   disk.device.detectSize( null, function( error, size ) {
  //     log( '[SIZE]', size, 'bytes' )
  //     log( '[SIZE]', size / 1024 / 1024, 'MB' )
  //     log( '[SIZE]', size / 1024 / 1024 / 1024, 'GB' )
  //     next()
  //   })
  // },
  
  function getEFIPartition( next ) {
    log( '[DISK] mounted' )
    // inspect( 'Disk', disk )
    log( '[DISK] getEFIPart()' )
    var efipart = disk.getEFIPart()
    inspect( 'EFI Partition', efipart )
    efipart == null ?
      void next( new Error( 'No EFI Partition' ) ) :
      void next()
  },
  
  function mountFileSystem( next ) {
    
    if( !disk.gpt )
      return next( new Error( 'No GPT detected' ) )
    
    console.log( disk.gpt )
    
    var partition = disk.gpt.partitions
      .filter( function( partition ) {
        return partition.name == 'BOOTCAMP'
      })[0]
    
    if( !partition )
      return next( new Error( 'No BOOTCAMP partition' ) )
    
    log( '[NTFS] mounting...' )
    inspect( '[NTFS] Partition', partition )
    fs.mount( disk, partition, next )
    
  },
  
  function unmountDisk( next ) {
    log( '[NTFS] mounted' )
    inspect( 'NTFS', fs )
    disk.close( next )
  },
  
], function( error ) {
  error && inspect( 'Fatal:', error )
})
