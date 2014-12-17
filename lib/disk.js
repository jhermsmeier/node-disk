var async = require( 'async' )

/**
 * Disk Constructor
 * @return {Disk}
 */
function Disk( device ) {
  
  if( !(this instanceof Disk) )
    return new Disk( device )
  
  this.device = device
  this.mbr = null
  this.gpt = null
  
}

// TODO: Support single, flat VBR
Disk.MBR = require( 'mbr' )
Disk.GPT = require( 'gpt' )

/**
 * Disk Prototype
 * @type {Object}
 */
Disk.prototype = {
  
  /**
   * Disk constructor
   * @type {Function}
   */
  constructor: Disk,
  
  /**
   * Opens the given device and
   * attempts to read the MBR/GPT
   * @param  {Function} callback
   * @return {Disk}
   */
  open: function( callback ) {
    
    var self = this
    callback = callback.bind( this )
    
    async.waterfall([
      function openDevice( next ) {
        self.device.open( next )
      },
      function readMBR( blocksize, next ) {
        self.readMBR( next )
      },
      function readGPT( mbr, next ) {
        self.readGPT( next )
      }
    ], function( error ) {
      callback( error )
    })
    
    return this
    
  },
  
  readMBR: function( callback ) {
    
    var self = this
    
    this.device.readLBA( 0, 1, null, function( error, buffer, bytesRead ) {
      if( error != null )
        return callback.call( self, error )
      try {
        self.mbr = new Disk.MBR( buffer )
        callback.call( self, null, self.mbr )
      } catch( error ) {
        callback.call( self, error )
      }
    })
    
    return this
    
  },
  
  getEFIPart: function() {
    if( this.mbr != null ) {
      // Scan partitions for EFI partition,
      // and return it if exists
      return this.mbr.partitions.filter( function( part ) {
        // Type 0xEE -> GPT with protective MBR
        // Type 0xEF -> GPT with hybrid MBR
        return part.type === 0xEE ||
          part.type === 0xEF
      })[0] // return first found, or, undefined
    }
  },
  
  readGPT: function( callback ) {
    
    var self = this
    var efiPartition = self.getEFIPart()
    var gpt = new Disk.GPT({
      blockSize: this.device.blockSize
    })
    
    if( efiPartition == null ) {
      callback.call( this, new Error( 'Missing (U)EFI Partition' ))
      return this
    }
    
    this.device.readLBA(
      efiPartition.firstLBA,
      efiPartition.firstLBA + 32,
      null,
      function( error, buffer, bytesRead ) {
        if( error != null )
          return callback.call( self, error )
        try {
          self.gpt = gpt.parse( buffer )
          callback.call( self, error, self.gpt )
        } catch( error ) {
          callback.call( self, error )
        }
      }
    )
    
    return this
    
  },
  
  close: function( callback ) {
    callback = callback.bind( this )
    this.device.close( callback )
    return this
  },
  
}

// Exports
module.exports = Disk
