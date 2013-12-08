var CRC32 = require( 'buffer-crc32' )
var GUID = require( '../guid' )
var Int64 = require( 'int64-native' )

function Header( data, options ) {
  
  if( !(this instanceof Header) )
    return new Header( data, options )
  
  options = this._options = options || {}
  this._options.blockSize = options.blockSize || 512
  
  this.revision = new Buffer([ 0, 0, 1, 0 ])
  this.size = 92
  this.headerCRC = 0
  
  this.currentLBA = 1
  this.backupLBA = -1
  this.firstLBA = 34
  this.lastLBA = -34
  
  this.guid = new GUID()
  
  this.partitionTableLBA = 2
  this.partitions = 128
  this.partitionEntrySize = 128
  this.partitionTableCRC = 0
  
  this._buffer = null
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    this._buffer = new Buffer( options.blockSize )
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

module.exports = Header

Header.SIGNATURE = 'EFI PART'

Header.prototype = {
  
  constructor: Header,
  
  set: function( data ) {
    if( data != null ) {
      if( data.revision != null )
        this.revision = data.revision
      if( data.size != null )
        this.size = data.size
      if( data.currentLBA != null )
        this.currentLBA = data.currentLBA
      if( data.backupLBA != null )
        this.backupLBA = data.backupLBA
      if( data.firstLBA != null )
        this.firstLBA = data.firstLBA
      if( data.lastLBA != null )
        this.lastLBA = data.lastLBA
      if( data.guid != null )
        this.guid = data.guid
      if( data.partitionTableLBA != null )
        this.partitionTableLBA = data.partitionTableLBA
      if( data.partitions != null )
        this.partitions = data.partitions
      if( data.partitionEntrySize != null )
        this.partitionEntrySize = data.partitionEntrySize
    }
  },
  
  get buffer() {
    
    this.revision.copy( this._buffer, 8 )
    
    this._buffer.writeUInt32LE( this.size, 12 )
    // Zero the CRC field for checksum calulation
    this._buffer.writeUInt32LE( this.headerCRC, 16 )
    
    var currentLBA = new Int64( this.currentLBA )
    
    this._buffer.writeUInt32LE( currentLBA.low32(), 24 )
    this._buffer.writeUInt32LE( currentLBA.high32(), 28 )
    
    var backupLBA = new Int64( this.backupLBA )
    
    this._buffer.writeUInt32LE( backupLBA.low32(), 32 )
    this._buffer.writeUInt32LE( backupLBA.high32(), 36 )
    
    var firstLBA = new Int64( this.firstLBA )
    
    this._buffer.writeUInt32LE( firstLBA.low32(), 40 )
    this._buffer.writeUInt32LE( firstLBA.high32(), 44 )
    
    var lastLBA = new Int64( this.lastLBA )
    
    this._buffer.writeUInt32LE( lastLBA.low32(), 48 )
    this._buffer.writeUInt32LE( lastLBA.high32(), 52 )
    
    this.guid.buffer.copy( this._buffer, 56 )
    
    var partitionTableLBA = new Int64( this.partitionTableLBA )
    
    this._buffer.writeUInt32LE( partitionTableLBA.low32(), 72 )
    this._buffer.writeUInt32LE( partitionTableLBA.high32(), 76 )
    
    this._buffer.writeUInt32LE( this.partitions, 80 )
    this._buffer.writeUInt32LE( this.partitionEntrySize, 84 )
    this._buffer.writeUInt32LE( this.partitionTableCRC, 88 )
    
    // Calculate checksum and write to buffer
    this.headerCRC = CRC32.unsigned( this._buffer.slice( 0, this.size ) )
    this._buffer.writeUInt32LE( this.headerCRC, 16 )
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    var signature = buffer.toString( 'ascii', 0, 8 )
    if( signature !== Header.SIGNATURE ) {
      throw new SyntaxError(
        'Invalid GPT header signature "' + signature + '" ' +
        '(should be "EFI PART")'
      )
    }
    
    buffer.copy( this.revision, 0, 8 )
    
    this.size      = buffer.readUInt32LE( 12 )
    this.headerCRC = buffer.readUInt32LE( 16 )
    
    this.currentLBA = +(new Int64(
      buffer.readUInt32LE( 28 ),
      buffer.readUInt32LE( 24 )
    ).toUnsignedDecimalString())
    
    this.backupLBA = +(new Int64(
      buffer.readUInt32LE( 36 ),
      buffer.readUInt32LE( 32 )
    ).toUnsignedDecimalString())
    
    this.firstLBA = +(new Int64(
      buffer.readUInt32LE( 44 ),
      buffer.readUInt32LE( 40 )
    ).toUnsignedDecimalString())
    
    this.lastLBA = +(new Int64(
      buffer.readUInt32LE( 52 ),
      buffer.readUInt32LE( 48 )
    ).toUnsignedDecimalString())
    
    this.guid = new GUID( buffer.slice( 56, 72 ) )
    
    this.partitionTableLBA = +(new Int64(
      buffer.readUInt32LE( 76 ),
      buffer.readUInt32LE( 72 )
    ).toUnsignedDecimalString())
    
    this.partitions         = buffer.readUInt32LE( 80 )
    this.partitionEntrySize = buffer.readUInt32LE( 84 )
    this.partitionTableCRC  = buffer.readUInt32LE( 88 )
    
    this._buffer = value
    
  }
  
}
