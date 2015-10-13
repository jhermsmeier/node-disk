var fs = require( 'fs' )
var BlockDevice = require( 'blockdevice' )

// NOTE: To add a new dump,
// modify `name` and `diskpath`
var name = 'os-version'
var diskpath = BlockDevice.getPath( 0 )

var filename = __dirname + '/../test/data/' + name + '.bin'
var device = new BlockDevice({
  path: diskpath,
  mode: 'r',
})

function close( error ) {
  if( error ) console.log( error.stack )
  console.log( '[CLOSING]' )
  device.close( function( error ) {
    if( error ) console.log( error.stack )
  })
}

console.log( '[OPENING]', device.path )
device.open( function( error ) {
  if( error ) throw error
  console.log( '[READING]', 0, 34 )
  device.readBlocks( 0, 34, function( error, buffer ) {
    if( error ) close( error )
    console.log( '[WRITING]', name )
    fs.writeFileSync( filename, buffer )
    close()
  })
})
