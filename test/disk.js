var Disk = require( '../' )
var BlockDevice = require( 'blockdevice' )
var assert = require( 'assert' )

;[
  'apple-mac-osx-10.10.3.bin',
  'bootcamp-osx-win.bin',
  'usb-thumb-exfat.bin',
  'usb-thumb-fat.bin'
].forEach( function( filename ) {

  const DISK_IMAGE = __dirname + '/data/' + filename

  describe( 'Disk ' + filename, function( t ) {

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

})
