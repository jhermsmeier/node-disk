#!/usr/bin/env node
var fs = require( 'fs' )
var path = require( 'path' )
var Disk = require( '..' )
var BlockDevice = require( 'blockdevice' )
var inspect = require( '../test/inspect' )
var filename = process.argv.slice(2).shift()

var device = new BlockDevice({
  path: filename,
  mode: 'r',
  blockSize: 512,
})

var disk = new Disk( device )

disk.open( function( error ) {
  console.log( error || inspect( disk ) )
  disk.close( function() {})
})
