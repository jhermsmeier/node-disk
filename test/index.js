
var disk = require( '../' )
var util = require( 'util' )

var hdd = disk.load( '\\\\.\\PhysicalDrive0' )

var out = util.inspect( hdd, {
  showHidden: false,
  depth: null,
  colors: true
})

console.log( disk )
process.stdout.write( '\n' + out + '\n' )
