/**
 * Disk constructor
 */
function Disk( options ) {
  
  if( !(this instanceof Disk) )
    return new Disk( options )
  
  options = this._options = options || {}
  
  this.device = null
  this.blockSize = options.blockSize || 512
  
  this.VBR = null
  this.MBR = null
  this.GPT = null
  
  this.volumes = []
  
  // Make "private" properties non-enumerable
  Object.keys( this ).map( function( key ) {
    key[0] === '_' ? Object.defineProperty( this, key, {
      value: this[ key ], writable: true,
      configurable: true, enumerable: false,
    }) : null
  }.bind( this ))
  
}

// Exports
module.exports = Disk

Disk.Device = require( './device' )
Disk.GUID = require( './guid' )
Disk.CHS = require( './chs' )

// GUID Partition Table
Disk.GPT = require( './gpt' )
// Master Boot Record
Disk.MBR = require( './mbr' )
// Volume Boot Record
Disk.VBR = require( './vbr' )

/**
 * Load the relevant parts from a device
 * @param  {Device}  device
 * @return {Disk}
 */
Disk.fromDevice = function( device ) {
  
  var disk = new Disk()
  
  disk.device = device
  disk.blockSize = device.blockSize
  
  // Look for a MBR
  disk.createMBR( device.readLBA( 0 ) )
  
  // Look for a VBR at disk start
  // (might be the case for UDF mediums or so)
  disk.createVBR( device.readLBA( 0 ) )
  
  // Check for an existing EFI partition,
  // and load GPT header and table
  var efipart = disk.getEFIPart()
  if( efipart ) {
    disk.createGPT(
      device.readLBA( 1 ),
      device.readLBA( 2, 34 ),
     { blockSize: device.blockSize } 
    )
  }
  
  var partitions = disk.GPT && disk.GPT.partitions ||
    disk.MBR && disk.MBR.partitions || []
  
  partitions.map( function( part ) {
    if( part.firstLBA > 0 ) {
      try {
        var sector = device.readLBA( part.firstLBA )
        var vbr = new Disk.VBR( sector )
        vbr.partition = part
        disk.volumes.push( vbr )
      } catch( error ) {
        // disk.volumes.push( error )
      }
    }
  })
  
  return disk
  
}

/**
 * Device disk prototype
 * @type {Object}
 */
Disk.prototype = {
  
  // Disk constructor
  constructor: Disk,
  
  getEFIPart: function() {
    if( this.MBR ) {
      // Scan partitions for EFI partition,
      // and return it if exists
      return this.MBR.partitions.filter( function( part ) {
        // Type 0xEE -> GPT with protective MBR
        // Type 0xEF -> GPT with hybrid MBR
        return part.type === 0xEE ||
          part.type === 0xEF
      })[0] // return first found, or, undefined
    }
  },
  
  createMBR: function( data ) {
    try { this.MBR = new Disk.MBR( data ) }
    catch( error ) { this.MBR = error }
  },
  
  createGPT: function( headerData, tableData ) {
    try { this.GPT = new Disk.GPT( headerData, tableData ) }
    catch( error ) { this.GPT = error }
  },
  
  createVBR: function( data ) {
    try { this.VBR = new Disk.VBR( data ) }
    catch( error ) { this.VBR = error }
  }
  
}
