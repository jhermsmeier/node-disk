var fs = require( 'fs' )
var os = require( 'os' )
var assert = require( 'assert' )

// Enables code paths which are
// being worshipped by the devil
global.DEVIL = global.DEVIL !== undefined ?
  global.DEVIL : !!process.env.SATAN

/**
 * Device constructor
 * @param {Number} id
 * @param {String} path
 */
function Device( id, path ) {
  
  if( !(this instanceof Device) )
    return new Device( id, path )
  
  this.fd = null
  this.id = id || 0
  
  // Use a pipe path, if given, else
  // try OS specific device descriptor
  this.path = path ? path :
    os.platform() === 'win32' ?
      '\\\\.\\PhysicalDrive' + this.id :
      '/dev/device' + this.id
  
  // Automount (open) the device
  this.mount()
  // Detect logical block size
  this.blockSize = Device.detectBlockSize( this.fd )
  
}

// Exports
module.exports = Device

Device.read = function( fd, offset, length, buffer ) {
  buffer = buffer || new Buffer( length )
  fs.readSync( fd, buffer, 0, length, offset )
  return buffer
}

Device.write = function( fd, offset, buffer ) {
  
  if( !DEVIL )
    throw new Error( 'Enable worshipping the devil' )
  
  return fs.writeSync( fd, buffer, 0, buffer.length, offset )
  
}

/**
 * Primitive logical block size detection
 * @param  {Number} fd
 * @param  {Number} [size=128]
 * @param  {Number} [step=128]
 * @param  {Number} [limit=8192]
 * @return {Number}
 */
Device.detectBlockSize = function( fd, size, step, limit ) {
  
  if( fd == null || typeof fd !== 'number' )
    throw new TypeError( 'Argument `fd` must be a valid file descriptor' )
  
  size = size || 0x200
  step = step || 0x80
  limit = limit || 0x2000
  
  while( size <= limit ) {
    try {
      var block = new Buffer( size )
      var bytesRead = fs.readSync( fd, block, 0, size, 0 )
      assert.equal( size, bytesRead, 'Size and bytes read mismatch' )
      break
    } catch( error ) {
      // EINVAL tells us that the block size
      // ain't just right (yet); everything
      // else is probably user error
      if( error.code !== 'EINVAL' )
        throw error
      // Increase the blocksize by `step`
      size += step
    }
  }
  
  return size
  
}

/**
 * Detect device size (experimental)
 * @param  {Number} fd
 * @param  {Number} blockSize
 * @param  {Number} [stepSize=1GB]
 * @return {Number} 
 */
Device.detectSize = function( fd, blockSize, step ) {
  
  if( !DEVIL )
    throw new Error( 'Enable worshipping the devil' )
  
  step = step || 1024 * 1024 * 1024
  
  var bytesRead, size = 0, offset = 0
  var block = new Buffer( blockSize )
  
  while( true ) {
    try {
      bytesRead = fs.readSync( fd, block, 0, blockSize, offset )
      size = offset
      offset += step
    } catch( error ) {
      if( error.code !== 'EIO' ) {
        // We're only interested in I/O errors,
        // since they signal OOB reading
        throw error
      } else if( step <= blockSize ) {
        // If our maximum accuracy is reached,
        // break out of the loop
        break
      } else {
        // Step back
        offset -= step
        // Decrease step size
        step = Math.max( step / 1024, 1 )
      }
    }
    // console.log( 'bytes read:', bytesRead )
    // console.log( 'offset:', offset )
    console.log( 'step size:', step )
    console.log( 'size:', size / 1024 / 1024 / 1024, 'GB' )
  }
  
  var blocks = Math.ceil( size / blockSize )
  var size = blocks * blockSize
  
  // console.log( 'blocks:', blocks, 'á', blockSize, 'B' )
  // console.log( 'size:', size, 'B' )
  
  return size
  
}

/**
 * Device prototype
 * @type {Object}
 */
Device.prototype = {
  
  constructor: Device,
  
  /**
   * Opens a file descriptor for this device
   * @return {Device}
   */
  mount: function() {
    
    if( this.fd != null )
      this.unmount()
    
    this.fd = fs.openSync(
      this.path, DEVIL ? 'rs+' : 'rs'
    )
    
    return this
    
  },
  
  /**
   * Closed the file descriptor
   * @return {Device}
   */
  unmount: function() {
    fs.closeSync( this.fd )
    this.fd = null
    return this
  },
  
  read: function( offset, length, buffer ) {
    return Device.read( this.fd, offset, length, buffer )
  },
  
  readLBA: function( fromLBA, toLBA, buffer ) {
    
    fromLBA = fromLBA || 0
    toLBA = toLBA || ( fromLBA + 1 )
    
    var from = this.blockSize * fromLBA
    var to = this.blockSize * toLBA
    
    return this.read( from, to - from, buffer )
    
  },
  
  write: function( offset, buffer ) {
    return Device.write( this.fd, offset, buffer )
  },
  
  writeLBA: function( fromLBA, buffer ) {
    var offset = this.blockSize * fromLBA
    return this.write( offset, buffer )
  }
  
}
