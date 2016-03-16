var Disk = require( '..' )
var BlockDevice = require( 'blockdevice' )

var log = console.log.bind( console )
var inspect = function( value ) {
  return require( 'util' ).inspect( value, {
    colors: true,
    depth: null,
  })
}

var device = new BlockDevice({
  path: BlockDevice.getPath( 2 ),
  mode: 'r',
  blockSize: 512
})

var disk = new Disk( device )

// OPEN
disk.open( function( error ) {
  
  if( error != null )
    log( inspect( error ) )
  
  // INSPECT
  log( inspect( disk ) )
  
  // END
  disk.close( function( error ) {
    if( error != null )
      throw error
  })
  
})
