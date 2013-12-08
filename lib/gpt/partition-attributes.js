function Attributes( data ) {
  
  if( !(this instanceof Attributes) )
    return new Attributes( data )
  
  this._bits = '0000000000000000000000000000000000000000000000000000000000000000'
  
  if( Buffer.isBuffer( data ) ) {
    this.buffer = data
  } else {
    this.set( data )
    void this.buffer
  }
  
}

module.exports = Attributes

Attributes.prototype = {
  
  constructor: Attributes,
  
  set: function( data ) {
    if( data != null ) {
      // TODO
    }
  },
  
  get: function( n ) {
    return this._bits[n] === '1'
  },
  
  get buffer() {
    return new Buffer(
      this._bits.split( /0{8}/g )
        .map( function( binary ) {
          return parseInt( binary, 2 )
        })
    )
  },
  
  set buffer( value ) {
    this._bits = [].slice.call( value )
      .map( function( byte ) {
        return ( '00000000' + byte.toString( 2 ) )
          .substr( -8 )
      }).join('')
  }
  
}
