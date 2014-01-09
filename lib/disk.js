/**
 * Disk constructor
 * @param {Object} options
 */
function Disk( options ) {
  
  if( !(this instanceof Disk) )
    return new Disk( options )
  
}

// Exports
module.exports = Disk

/**
 * Device disk prototype
 * @type {Object}
 */
Disk.prototype = {
  
  constructor: Disk,
  
}
