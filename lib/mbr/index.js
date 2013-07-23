
/**
 * MBR constructor
 * @param {Buffer} buffer
 */
function MBR( buffer ) {
  
  if( !(this instanceof MBR) )
    return new MBR( buffer )
  
  if( buffer.length < 512 )
    throw new Error( 'MBR buffer too small' )
  
  if( buffer.readUInt16LE( 0x1FE ) !== 0xAA55 ) {
    return new Error(
      'Invalid MBR boot signature. Expected 0xAA55, ' +
      'but saw 0x' + buffer.readUInt16LE( 0x1FE )
        .toString( 16 ).toUpperCase()
    )
  }
  
  this.partitions = []
  this.readPartitionTable( buffer )
  
}

// Exports
module.exports = MBR

// MBR partition table enty
MBR.Partition = require( './partition' )

/**
 * MBR prototype
 * @type {Object}
 */
MBR.prototype = {
  
  constructor: MBR,
  
  readPartitionTable: function( buffer ) {
    
    // Generic partition table start
    // offset is 446 [0x1BE] and has
    // 4 entries, each 16 byte long
    // (ends at 510 [0x1FE])
    var offset = 0x1BE
    
    for( var i = 0; i < 4; i++ ) {
      this.partitions[i] = new MBR.Partition(
        buffer.slice( offset, offset += 0x10 )
      )
    }
    
  }
  
}
