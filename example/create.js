#!/usr/bin/env node
var fs = require( 'fs' )
var path = require( 'path' )
var BlockDevice = require( 'blockdevice' )
var Disk = require( '..' )
var inspect = require( '../test/inspect' )

var argv = process.argv.slice( 2 )
var size = parseInt( argv.shift(), 10 )
var format = argv.shift()
var filename = argv.shift()

var usage = `
  Usage: node example/create <size> <format> <outputfile>

    size:         size of image in bytes
    format:       mbr[:type] | gpt | hybrid
    outputfile:   image file path to create
`

// Check arguments
if( !size || !format || !filename ) {
  console.log( usage )
  process.exit( 1 )
}

// Make sure that's lowercase
format = format.toLowerCase()
// Resolve the path to the image file to an absolute path
filename = path.resolve( process.cwd(), filename )

// Remove the image file first to make sure it's zerofilled
try { fs.unlinkSync( filename, '' ) }
catch( error ) { void error } // don't care

// Create the image file
console.log( 'Creating', path.basename( filename ) )
fs.writeFileSync( filename, '' )

// Allocate / truncate to given size
console.log( 'Allocating', size / (1024 * 1024), 'MB' )
fs.truncateSync( filename, size )

console.log( 'Creating block device' )
var device = new BlockDevice({
  path: filename,
  blockSize: 512,
  mode: 'r+',
  size: size,
})

console.log( 'Opening disk' )
var disk = new Disk( device )

function close( error ) {
  if( error ) console.error( error )
  console.log( 'Closing disk...' )
  disk.close( function() {
    console.log( error ? '[ERROR]' : '[OK]', 'Done' )
    process.exit( error ? 1 : 0 )
  })
}

// Get the CHS disk geometry from its total size in blocks
function getGeometry( blocks ) {
  var g = new Disk.MBR.CHS( 1, 1, 63 )
  // The equation to solve is:
  // g.cylinder * g.head * g.sector === blocks
}

disk.open( function( error ) {

  if( error ) return close( error )
  console.log( 'Opened', inspect( this ) )

  if( format === 'mbr' ) {

    var type = format.indexOf(':') !== -1 ?
      format.split(':').pop() : 'modern'

    type = type.toUpperCase()

    if( typeof Disk.MBR[type] !== 'function' ) {
      return close( new Error( `Invalid MBR type "${type}"` ) )
    }

    console.log( 'Creating Master Boot Record' )
    disk.mbr = new Disk.MBR[type]()

    console.log( 'Writing MBR', inspect( disk.mbr ) )
    disk.writeMBR( function( error ) {
      console.log( 'Master Boot Record written' )
      close( error )
    })

  }

  if( format === 'gpt' || format === 'hybrid' ) {

    // Total number of logically addressable blocks
    var totalBlocks = ( device.size / device.blockSize )
    // Last addressable block on the device
    var lastLBA = totalBlocks - 1

    console.log( 'Creating Master Boot Record' )
    disk.mbr = new Disk.MBR.MODERN()

    var part = this.mbr.partitions[0]
    if( format !== 'hybrid' ) {
      // Protective MBRs span as much as they can
      // of the device / image to avoid anything mucking with it
      part.type = 0xEE
      part.firstLBA = 1
      part.sectors = totalBlocks - 1
      part.firstCHS.cylinder = 1023
      part.firstCHS.head = 254
      part.firstCHS.sector = 63
      part.lastCHS.cylinder = 1023
      part.lastCHS.head = 254
      part.lastCHS.sector = 63
    } else {
      // NOTE: Hybrid MBRs only really makes sense
      // when you're also partitioning the device / image
      part.type = 0xEF
    }

    console.log( 'Creating GUID Partition Table' )
    disk.gpt = new Disk.GPT({
      // LBA of primary GPT
      currentLBA: 1,
      // LBA of secondary GPT
      backupLBA: lastLBA,
      // LBA of first "user-space" block
      firstLBA: 34,
      // LBA of last "user-space" block
      lastLBA: lastLBA - 35,
    })

    console.log( 'Writing MBR', inspect( disk.mbr ) )
    disk.writeMBR( function( error ) {

      if( error ) return close( error )
      console.log( 'Master Boot Record written' )

      console.log( 'Writing', inspect( disk.gpt ) )
      disk.writeGPT( function( error ) {
        if( error ) return close( error )
        console.log( 'GUID Partition Table written' )
        close( error )
      })

    })

  }

})
