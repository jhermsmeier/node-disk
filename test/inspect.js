var util = require( 'util' )
var options = { depth: null, colors: process.stdout.isTTY }

module.exports = function inspect( value ) {
  return util.inspect( value, options )
}
