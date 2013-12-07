
var disk = require( '../' )
var util = require( 'util' )

const HDD = '\\\\.\\PhysicalDrive0'
const SDC = '\\\\.\\PhysicalDrive1'
const USB = '\\\\.\\PhysicalDrive2'

var hdd = disk.load( SDC )

var out = util.inspect( hdd, {
  showHidden: false,
  depth: null,
  colors: true
})

process.stdout.write( '\n' + out + '\n' )
