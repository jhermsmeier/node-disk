var CRC32 = require( 'buffer-crc32' )
var assert = require( 'assert' )

function GPT( header, table, options ) {
  
  if( !(this instanceof GPT) )
    return new GPT( header, table, options )
  
  options = this._options = options || {}
  this._options.blockSize = options.blockSize || 512
  
  this.header = new GPT.Header( header )
  this.partitions = []
  this._buffer = null
  
  if( Buffer.isBuffer( table ) ) {
    this.buffer = table
  } else {
    
    this._buffer = new Buffer(
      this.header.partitions *
      options.blockSize
    )
    
    this._buffer.fill( 0 )
    this.set( table )
    void this.buffer
    
  }
  
  // Make "private" properties non-enumerable
  Object.keys( this ).map( function( key ) {
    key[0] === '_' ? Object.defineProperty( this, key, {
      value: this[ key ], writable: true,
      configurable: true, enumerable: false,
    }) : null
  }.bind( this ))
  
}

module.exports = GPT

GPT.Header = require( './header' )
GPT.Partition = require( './partition' )

GPT.prototype = {
  
  constructor: GPT,
  
  set: function( data ) {
    if( data != null ) {
      if( data.partitions != null )
        this.partitions = data.partitions
    }
  },
  
  get buffer() {
    
    this._buffer = Buffer.concat(
      this.partitions.map( function( partition ) {
        return partition.buffer
      })
    )
    
    // Update partition table checksum in header
    this.header.partitionTableCRC =
      CRC32.unsigned( this._buffer )
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    this._buffer = buffer
    
    var offset = 0
    
    for( var i = 0; i < this.header.partitions; i++ ) {
      this.partitions[i] = new GPT.Partition(
        buffer.slice( offset, offset += this.header.partitionEntrySize )
      )
    }
    
  },
  
  checkIntegrity: function() {
    // TODO
  },
  
  repair: function() {
    // TODO
  }
  
}
