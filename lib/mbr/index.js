function MBR( data ) {
  
  if( !(this instanceof MBR) )
    return new MBR( data )
  
  this.type = 'CLASSIC'
  this.partitionCount = 4
  this.tableOffset = 0x1BE
  this.partitions = []
  this._buffer = null
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    this._buffer = new Buffer( 512 )
    this._buffer.fill( 0 )
    this.set( data )
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

module.exports = MBR

MBR.Partition = require( './partition' )

MBR.prototype = {
  
  constructor: MBR,
  
  set: function( data ) {
    if( data != null ) {
      if( data.type != null )
        this.type = data.type
      if( data.partitions != null )
        this.partitions = data.partitions
    }
  },
  
  get buffer() {
    
    var self = this
    
    this.partitions.map( function( part, i ) {
      part.buffer.copy( self._buffer, self.tableOffset + i * 16 )
    })
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    if( buffer.length < 512 )
      throw new Error( 'MBR buffer too small' )
    
    if( buffer.readUInt16LE( 0x1FE ) !== 0xAA55 ) {
      throw new SyntaxError(
        'Invalid MBR boot signature. Expected 0xAA55, ' +
        'but saw 0x' + buffer.readUInt16LE( 0x1FE )
          .toString( 16 ).toUpperCase()
      )
    }
    
    this._buffer = buffer
    
    // Generic partition table start
    // offset is 446 [0x1BE] and has
    // 4 entries, each 16 byte long
    // (ends at 510 [0x1FE])
    var tableOffset = this.tableOffset
    
    // Check for AST/NEC signature
    if( buffer[ 0x17C ] === 0x5A && buffer[ 0x17D ] === 0xA5 ) {
      this.type = 'AST'
      tableOffset = this.tableOffset = 0x17E
      this.partitionCount = 8
    }
    
    // Check for Disk Manager signature
    if( buffer[ 0x0FC ] === 0xAA && buffer[ 0x0FD ] === 0x55 ) {
      this.type = 'DM'
      tableOffset = this.tableOffset = 0x0FE
      this.partitionCount = 16
    }
    
    // Check for NEWLDR signature
    if( buffer.toString( 'ascii', 0x02 ) === 'NEWLDR' ) {
      this.type = 'NEWLDR'
    }
    
    // Check for AAP signature
    if( buffer[ 0x1AC ] === 0x78 && buffer[ 0x1AD ] === 0x56 ) {
      this.type = 'AAP'
    }
    
    // Check for "modern standard"
    if( buffer[ 0x0DA ] === 0x00 && buffer[ 0x0DB ] === 0x00 ) {
      this.type = 'MODERN'
    }
    
    for( var i = 0; i < this.partitionCount; i++ ) {
      this.partitions[i] = new MBR.Partition(
        buffer.slice( tableOffset, tableOffset += 0x10 )
      )
    }
    
    return this
    
  }
  
}
