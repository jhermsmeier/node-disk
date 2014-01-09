var CHS = require( '../chs' )

function Partition( data ) {
  
  if( !(this instanceof Partition) )
    return new Partition( data )
  
  // Partition status
  //  0x80      = active
  //  0x00      = inactive
  //  0x01-0x7F = invalid
  this.status = 0x00
  // Partition type (see partition-types)
  this.type = 0x00
  this.info = []
  
  this.firstCHS = new CHS()
  this.lastCHS = new CHS()
  this.firstLBA = 0x00
  
  this.sectors = 0x00
  
  this._buffer = null
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    
    this._buffer = new Buffer( 16 )
    this._buffer.fill( 0 )
    
    if( data != null ) {
      if( data.status != null )   this.status = data.status
      if( data.type != null )     this.type = data.type
      if( data.firstCHS != null ) this.firstCHS = new CHS( data.firstCHS )
      if( data.lastCHS != null )  this.lastCHS = new CHS( data.lastCHS )
      if( data.firstLBA != null ) this.firstLBA = data.firstLBA
      if( data.sectors != null )  this.sectors = data.sectors
    }
    
  }
  
  // Make "private" properties non-enumerable
  Object.keys( this ).map( function( key ) {
    key[0] === '_' ? Object.defineProperty( this, key, {
      value: this[ key ], writable: true,
      configurable: true, enumerable: false,
    }) : null
  }.bind( this ))
  
}

module.exports = Partition

// Master Boot Record partition types
Partition.TYPES = require( './partition-types' )

Partition.prototype = {
  
  constructor: Partition,
  
  get buffer() {
    
    this._buffer.writeUInt8( this.status, 0 )
    this._buffer.writeUInt8( this.type, 4 )
    this._buffer.writeUInt32LE( this.firstLBA, 8 )
    this._buffer.writeUInt32LE( this.sectors, 12 )
    
    this.firstCHS.buffer.copy( this._buffer, 1 )
    this.lastCHS.buffer.copy( this._buffer, 5 )
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    if( buffer.length !== 16 ) {
      throw new SyntaxError(
        'Partition entry size unacceptable:' +
        'expected 16 bytes, but got ' + data.length
      )
    }
    
    this._buffer = value
    
    this.status   = value.readUInt8( 0 )
    this.type     = value.readUInt8( 4 )
    this.info     = Partition.TYPES[ this.type ]
    this.firstLBA = value.readUInt32LE( 8 )
    this.sectors  = value.readUInt32LE( 12 )
    
    this.firstCHS.buffer = this._buffer.slice( 1, 4 )
    this.lastCHS.buffer = this._buffer.slice( 5, 8 )
    
  }
  
}
