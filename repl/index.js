var os = require( 'os' )
var repl = require( 'repl' )
var Disk = require( '..' )
var BlockDevice = require( 'blockdevice' )

var log = console.log.bind( console )
var inspect = function( value ) {
  return require( 'util' ).inspect( value, {
    colors: true,
    depth: null,
  })
}

var empty = '(' + os.EOL + ')'

repl.start({
  input: process.stdin,
  output: process.stdout,
  context: global,
  eval: function( cmd, context, filename, callback ) {
    if( cmd === empty ) return callback()
    try {
      var result = eval( cmd )
      callback( null, result )
    } catch( e ) {
      callback( e )
    }
  },
})
