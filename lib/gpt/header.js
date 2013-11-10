
var GUID = require( '../guid' )

function readUInt64LE( buffer, offset ) {
  offset = offset || 0
  var low = buffer.readUInt32LE( offset )
  var num = buffer.readUInt32LE( offset + 4 ) * 4294967296.0 + low
  if( low < 0 ) num += 4294967296
  return num
}

/**
 * Header constructor
 * @param {Buffer} buffer
 */
function Header( buffer ) {
  
  if( !(this instanceof Header) )
    return new Header( buffer )
  
  // Revision (for GPT version 1.0 (through at least UEFI version 2.3.1),
  // the value is 00 00 01 00)
  this.revision = buffer.slice( 8, 12 )
  
  // Header size in little endian
  // (in bytes, usually 5C 00 00 00 meaning 92 bytes)
  this.headerSize = buffer.readUInt32LE( 12 )
  
  // CRC32 of header (offset +0 up to header size),
  // with this field zeroed during calculation
  this.CRC32 = buffer.slice( 16, 20 )
  
  // Current LBA (location of this header copy)
  // TODO: read UInt64
  this.currentLBA = readUInt64LE( buffer, 24 )
  
  // Backup LBA (location of the other header copy)
  // TODO: read UInt64
  this.backupLBA = readUInt64LE( buffer, 32 )
  
  // Disk GUID
  this.GUID = new GUID( buffer.slice( 56, 72 ) )
    .toString()
  
  // Starting LBA of array of partition entries
  // (always 2 in primary copy)
  this.partitionTableLBA = readUInt64LE( buffer, 72 )
  
  // Number of partition entries in array
  this.partitionEntryCount = buffer.readUInt32LE( 80 )
  
  // Size of a single partition entry (usually 128)
  this.partitionEntrySize = buffer.readUInt32LE( 84 )
  
  // CRC32 of partition array
  this.partitionTableCRC32 = buffer.slice( 88, 92 )
  
}

// Exports
module.exports = Header

/**
 * Header prototype
 * @type {Object}
 */
Header.prototype = {
  
  constructor: Header
  
}
