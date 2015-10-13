var Disk = require( '../' )
var BlockDevice = require( 'blockdevice' )
var assert = require( 'assert' )

const DISK_IMAGE = __dirname + '/data/bootcamp-osx-win.bin'

describe( 'Disk', function( t ) {
  
  var device = null
  var disk = null
  
  it( 'init block device', function() {
    assert.doesNotThrow( function() {
      device = new BlockDevice({
        path: DISK_IMAGE,
        mode: 'r',
        blockSize: 512
      })
    })
  })
  
  it( 'init disk with device', function() {
    assert.doesNotThrow( function() {
      disk = new Disk( device )
    })
  })
  
  it( 'disk.open()', function( next ) {
    disk.open( function( error ) {
      next( error )
    })
  })
  
  it( 'repeat disk.open()', function( next ) {
    disk.open( function( error ) {
      next( error )
    })
  })
  
  it( 'disk.close()', function( next ) {
    disk.close( function( error ) {
      next( error )
    })
  })
  
})
