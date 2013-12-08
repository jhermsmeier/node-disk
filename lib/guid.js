function GUID( data ) {
  
  if( !(this instanceof GUID) )
    return new GUID( data )
  
  this._buffer = new Buffer( 16 )
  
  Buffer.isBuffer( data ) ?
    this.buffer = data :
    this.parse( data )
  
}

module.exports = GUID

GUID.prototype = {
  
  constructor: GUID,
  
  get buffer() {
    return this._buffer
  },
  
  set buffer( value ) {
    
    var buffer = Buffer.isBuffer( value ) ?
      value : new Buffer( value )
    
    buffer.copy( this._buffer )
    
  },
  
  get string() {
    return this.toString()
  },
  
  set string( value ) {
    this.parse( value )
  },
  
  parse: function( string ) {
    
    string = ( string || '' )
      .replace( /[^0-9A-F]/gi, '' )
    
    this._buffer.write( string, 'hex' )
    
    return this
    
  },
  
  toString: function( format ) {
    
    var buffer = this._buffer
    var slice = Array.prototype.slice
    
    var string = [
      slice.call( buffer, 0, 4 ).reverse(),
      slice.call( buffer, 4, 6 ).reverse(),
      slice.call( buffer, 6, 8 ).reverse(),
      slice.call( buffer, 8, 10 ),
      slice.call( buffer, 10 )
    ].map( function( block ) {
      return block.map( function( n ) {
        return ( '0' + n.toString( 16 ) ).substr( -2 )
      }).join( '' )
    }).join( '-' ).toUpperCase()
    
    return format === false ?
      string.replace( /[^0-9A-F]/gi, '' ) :
      string
    
  },
  
  valueOf: function() {
    return this.toString()
  },
  
  inspect: function() {
    return '{'+this.toString()+'}'
  }
  
}