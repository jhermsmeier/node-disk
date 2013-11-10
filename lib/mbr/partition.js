
/**
 * Partition constructor
 * @param {Buffer} buffer
 */
function Partition( buffer ) {
  
  if( !(this instanceof Partition) )
    return new Partition( buffer )
  
  // Partition status
  //  0x80      = active
  //  0x00      = inactive
  //  0x01-0x7F = invalid
  this.status = buffer.readUInt8( 0 )
  
  // Partition type
  this.type = buffer.readUInt8( 4 )
  
  this.info = Partition.TYPES[ this.type ] ||
    { OS: null, description: null }
  
  // CHS address of first
  // absolute sector in partition
  this.firstCHS = buffer.slice( 1, 4 )
    .readUInt16LE( 0 )
  
  // CHS address of last
  // absolute sector in partition
  this.lastCHS = buffer.slice( 5, 8 )
    .readUInt16LE( 0 )
  
  // LBA of first absolute sector
  // in the partition
  this.LBA = buffer.readUInt32LE( 8 )
  
  // Number of sectors in partition
  this.sectors = buffer.slice( 12 )
    .readUInt32LE( 0 )
  
}

// Exports
module.exports = Partition

// Master Boot Record partition types
Partition.TYPES = require( './partition_types' )

/**
 * Partition prototype
 * @type {Object}
 */
Partition.prototype = {
  
  constructor: Partition,
  
  get active() {
    return this.status === 0x80
  }
  
}
