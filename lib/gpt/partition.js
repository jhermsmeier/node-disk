
var GUID = require( '../guid' )

/**
 * Partition constructor
 * @param {Buffer} buffer
 */
function Partition( buffer ) {
  
  if( !(this instanceof Partition) )
    return new Partition( buffer )
  
  // Unique partition GUID
  this.GUID = new GUID(
    buffer.slice( 16, 32 )
  ).toString()
  
  // Partition type GUID
  this.type = new GUID(
    buffer.slice( 0, 16 )
  ).toString()
  
  // Partition name (36 UTF-16LE code units)
  this.name = buffer.slice( 56, 128 )
  // Attribute flags
  this.attributes = buffer.slice( 48, 56 )
  
  // First LBA (little endian)
  // TODO: Read UInt64LE
  this.firstLBA = buffer.slice( 32, 40 )
  
  // Last LBA (inclusive, usually odd)
  this.lastLBA = buffer.slice( 40, 48 )
  
}

// Exports
module.exports = Partition

/**
 * Partition prototype
 * @type {Object}
 */
Partition.prototype = {
  
  constructor: Partition
  
}
