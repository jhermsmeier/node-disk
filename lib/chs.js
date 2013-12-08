function CHS( data ) {
  
  if( !(this instanceof CHS) )
    return new CHS( data )
  
  this.cylinder = 0 // [0,1023]
  this.head = 0 // [0,255]
  this.sector = 0 // [1,63]
  this._buffer = null
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    this.buffer = new Buffer([ 0xFE, 0xFF, 0xFF ])
    if( data != null ) {
      if( data.cylinder != null )
        this.cylinder = data.cylinder
      if( data.head != null )
        this.head = data.head
      if( data.sector != null )
        this.sector = data.sector
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

module.exports = CHS

CHS.prototype = {
  
  constructor: CHS,
  
  get buffer() {
    
    this._buffer.writeUInt8( this.head, 0 )
    
    this._buffer.writeUInt8(
      (( this.cylinder >> 2 ) & 0xC0 ) ^ this.sector, 1
    )
    
    this._buffer.writeUInt8(
      this.cylinder & 0xFF, 2
    )
    
    return this._buffer
    
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    if( buffer.length !== 3 ) {
      throw new SyntaxError(
        'Invalid buffer size: should be 3 bytes, ' +
        'got ' + buffer.length
      )
    }
    
    this._buffer = buffer
    
    this.head = buffer.readUInt8( 0 )
    // Sector in bits 5–0;
    // bits 7–6 are high bits of cylinder
    this.sector = buffer.readUInt8( 1 ) & 0x3F // 00111111b
    // Bits 7-6 from sector & bits 7–0 of cylinder
    this.cylinder = (( buffer.readUInt8( 1 ) & 0xC0 ) << 2 ) | // 11000000b
      buffer.readUInt8( 2 )
    
    // DEBUG
    // function bin( n ) {
    //   return ('0000000000000000' + n.toString( 2 ))
    //     .substr( -16 )
    // }
    // this.cyls = bin( ( buffer.readUInt8( 1 ) & 0xC0 ) << 2 )
    // this.cylc = bin( buffer.readUInt8( 2 ) )
    // this.cylx = bin( this.cylinder )
    
  },
  
  toLBA: function() {
    
  }
  
}