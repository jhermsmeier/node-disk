
/**
 * GPT constructor
 * @param {Disk} disk
 */
function GPT( disk ) {
  
  if( !(this instanceof GPT) )
    return new GPT( disk )
  
  var header = disk.readLBA( 1 )
  var signature = header.slice( 0, 8 )
    .toString( 'ascii' )
  
  if( signature !== 'EFI PART' ) {
    return new Error( 'Invalid GPT' )
  }
  
  this.header = new GPT.Header( header )
  
  this.partitions = []
  this.readPartitionTable( disk )
  
}

// Exports
module.exports = GPT

GPT.Header = require( './header' )
GPT.Partition = require( './partition' )

/**
 * GPT prototype
 * @type {Object}
 */
GPT.prototype = {
  
  constructor: GPT,
  
  readPartitionTable: function( disk ) {
    
    this.partitions = []
    
    var len = this.header.partitionEntryCount
    var size = this.header.partitionEntrySize
    
    var table = disk.readLBA(
      this.header.partitionTableLBA,
      len * size / 512
    )
    
    var i, start, end, part
    
    for( i = 0; i < len; i++ ) {
      start = i * size
      end = start + size
      part = new GPT.Partition( table.slice( start, end ) )
      if( part.type !== '00000000-0000-0000-0000-000000000000' ) {
        this.partitions.push( part )
      }
    }
    
  }
  
}
