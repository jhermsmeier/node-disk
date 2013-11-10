
var GUID = require( '../guid' )

function readUInt64LE( buffer, offset ) {
  offset = offset || 0
  var low = buffer.readUInt32LE( offset )
  var num = buffer.readUInt32LE( offset + 4 ) * 4294967296.0 + low
  if( low < 0 ) num += 4294967296
  return num
}

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
  
  this.info = Partition.TYPES[ this.type ] ||
    { OS: null, description: null }
  
  // Partition name (36 UTF-16LE code units)
  this.name = buffer.slice( 56, 128 )
    .toString( 'ucs2' )
    .replace( /\x00/g, '' )
  
  // Attribute flags
  this.attributes = buffer.slice( 48, 56 )
  
  // First LBA [UInt64LE]
  // NOTE: These LBA numbers are not reliable,
  // because of JavaScripts integers, so be aware of values > 2^32
  this.firstLBA = readUInt64LE( buffer, 32 )
  
  // Last LBA [UInt64LE] (inclusive, usually odd)
  this.lastLBA = readUInt64LE( buffer, 40 )
  
}

// Exports
module.exports = Partition

// GUID Partition Types
Partition.TYPES = require( './partition_types' )

/**
 * Partition prototype
 * @type {Object}
 */
Partition.prototype = {
  
  constructor: Partition
  
}
