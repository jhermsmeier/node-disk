var GUID = require( '../guid' )
var Int64 = require( 'int64-native' )

function Partition( data ) {
  
  if( !(this instanceof Partition) )
    return new Partition( data )
  
  this.type = new GUID()
  this.guid = new GUID()
  this.name = ''
  this.attributes = new Buffer( 8 )
  this.info = {}
  
  this.firstLBA = 0
  this.lastLBA = 0
  
  this._buffer = null
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    this._buffer = new Buffer( 128 )
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

module.exports = Partition

Partition.TYPES = require( './partition-types' )
Partition.Attributes = require( './partition-attributes' )

Partition.prototype = {
  
  constructor: Partition,
  
  set: function( data ) {
    if( data != null ) {
      if( data.type != null )
        this.type.string = data.type
      if( data.guid != null )
        this.guid.string = data.guid
      if( data.name != null )
        this.name = data.name
      if( data.attributes != null )
        this.attributes = data.attributes
      if( data.info != null )
        this.info = data.info
      if( data.firstLBA != null )
        this.firstLBA = data.firstLBA
      if( data.lastLBA != null )
        this.lastLBA = data.lastLBA
    }
  },
  
  get buffer() {
    
    this.type.buffer.copy( this._buffer, 0 )
    this.guid.buffer.copy( this._buffer, 16 )
    
    this._buffer.write( this.name, 56, 'ucs2' )
    
    this.attributes.copy( this._buffer, 48 )
    
    var firstLBA = new Int64( this.firstLBA )
    
    this._buffer.writeUInt32LE( firstLBA.low32(), 32 )
    this._buffer.writeUInt32LE( firstLBA.high32(), 36 )
    
    var lastLBA = new Int64( this.lastLBA )
    
    this._buffer.writeUInt32LE( lastLBA.low32(), 40 )
    this._buffer.writeUInt32LE( lastLBA.high32(), 44 )
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    this._buffer = buffer
    
    this.type.buffer = buffer.slice( 0, 16 )
    this.guid.buffer = buffer.slice( 16, 32 )
    
    this.info = Partition.TYPES[ this.type.string ]
    
    this.name = buffer.toString( 'ucs2', 56, 128 )
      .replace( /\x00/g, '' )
    
    buffer.copy( this.attributes, 0, 48, 56 )
    
    this.firstLBA = +(new Int64(
      buffer.readUInt32LE( 36 ),
      buffer.readUInt32LE( 32 )
    ).toUnsignedDecimalString())
    
    this.lastLBA = +(new Int64(
      buffer.readUInt32LE( 44 ),
      buffer.readUInt32LE( 40 )
    ).toUnsignedDecimalString())
    
    
  }
  
}
