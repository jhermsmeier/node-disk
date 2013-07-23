
/**
 * GUID constructor
 * @param {Buffer|String} data
 */
function GUID( data ) {
  
  if( !(this instanceof GUID) )
    return new GUID( data )
  
  this.bytes = null
  this.string = null
  
  if( typeof data === 'string' ) {
    this.string = data
    this.bytes = this.toBuffer()
  } else {
    this.bytes = data
    this.string = this.toString()
  }
  
}

// Exports
module.exports = GUID

/**
 * GUID prototype
 * @type {Object}
 */
GUID.prototype = {
  
  constructor: GUID,
  
  toBuffer: function() {
    
    var i = 0
    var buffer = new Buffer( 16 )
    
    if( this.bytes ) {
      this.bytes.copy( buffer )
    } else {
      buffer.fill( 0 )
      this.string.replace( /[0-9A-F]{2}/ig,
        function( h ) { buffer[i++] = parseInt( h, 16 ) }
      )
    }
    
    return buffer
    
  },
  
  toString: function( braces ) {
    if( this.string ) {
      
      return braces
        ? '{'+this.string+'}'
        : this.string
      
    } else {
      
      var bytes = this.bytes
      var i, string = ''
      
      var buffer = []
        .concat( [].slice.call( bytes, 0, 4 ).reverse() )
        .concat( [].slice.call( bytes, 4, 6 ).reverse() )
        .concat( [].slice.call( bytes, 6, 8 ).reverse() )
        .concat( [].slice.call( bytes, 8 ) )
      
      for( i = 0; i < 16; i++ ) {
        if( i == 4 || i == 6 || i == 8 || i == 10 )
          string += '-'
        string += ( '0' + ( buffer[i].toString( 16 ).toUpperCase() )).substr( -2 )
      }
      
      return braces
        ? '{'+string+'}'
        : string
      
    }
  }
  
}
