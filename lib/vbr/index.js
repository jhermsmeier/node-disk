function VBR( data ) {
  
  if( !(this instanceof VBR) )
    return new VBR( data )
  
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

module.exports = VBR

VBR.prototype = {
  
  constructor: VBR,
  
  set: function( data ) {
    if( data != null ) {
      // TODO
    }
  },
  
  get buffer() {
    
    // TODO
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    this._buffer = buffer
    
    if( buffer[ 0x1FE ] !== 0x55 || buffer[ 0x1FF ] !== 0xAA )
      throw new SyntaxError( 'Invalid VBR bootloader signature' )
    
    // No JMP to bootloader code -> probably no VBR
    if( buffer[0] !== 0xEB && buffer[0] !== 0xE9 )
      throw new Error( 'No JMP to bootloader code detected' )
    
    // 0x20 padded OEM/System name
    this.systemName = buffer.slice( 0x03, 0x03 + 0x08 )
      .toString( 'ascii' )
      .replace( /\s|\x00/g, '' )
    
    this.type = buffer.slice( 0x15, 0x16 )
    
    this.bytesPerSector    = buffer.readUInt16LE( 0x0B )
    this.sectorsPerCluster = buffer.readUInt8( 0x0D )
    this.clusterSize       = this.bytesPerSector * this.sectorsPerCluster
    this.numberOfFATs      = buffer.readUInt8( 0x10 )
    this.maxEntries        = buffer.readUInt8( 0x11 )
    this.sectorsPerFAT     = buffer.readUInt16LE( 0x16 )
    this.sectorsPerTrack   = buffer.readUInt16LE( 0x18 )
    this.headsPerTrack     = buffer.readUInt16LE( 0x1A )
    this.hiddenSectors     = buffer.readUInt16LE( 0x1C )
    this.reservedSectors   = buffer.readUInt16LE( 0x0E )
    
    this.sectors = buffer.readUInt16LE( 0x13 ) ||
      buffer.readUInt16LE( 0x20 )
    
  }
  
}
