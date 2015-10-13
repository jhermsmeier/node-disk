var Disk = require( '../' )
var BlockDevice = require( 'blockdevice' )
var test = require( 'tape' )

const DISK_IMAGE = __dirname + '/data/bootcamp-osx-win.bin'

test( 'Disk', function( t ) {
  
  var device = null
  var disk = null
  
  t.doesNotThrow( function() {
    device = new BlockDevice({
      path: DISK_IMAGE,
      mode: 'r',
      blockSize: 512
    })
  }, null, 'init block device' )
  
  t.doesNotThrow( function() {
    disk = new Disk( device )
  }, null, 'init disk with device' )
  
  t.test( 'disk.open()', function( t ) {
    disk.open( function( error ) {
      t.error( error, 'success' )
      t.end()
    })
  })
  
  t.test( 'repeat disk.open()', function( t ) {
    disk.open( function( error ) {
      t.error( error, 'success' )
      t.end()
    })
  })
  
  t.test( 'disk.close()', function( t ) {
    disk.close( function( error ) {
      t.error( error, 'success' )
      t.end()
    })
  })
  
})
