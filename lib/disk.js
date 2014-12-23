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
  
  getPartition: function( n ) {
    
    if( this.gpt ) {
      var part = this.gpt.partitions[ n ]
      return part && this.device.partition({
        firstLBA: part.firstLBA,
        lastLBA: part.lastLBA,
      })
    }
    
    if( this.mbr ) {
      var part = this.mbr.partitions[ n ]
      return part && this.device.partition({
        firstLBA: part.firstLBA,
        lastLBA: part.lastLBA,
      })
    }
    
  },
  
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
        
        var efiPartition = self.getEFIPart()
        if( efiPartition == null )
          return void next( new Error( 'Missing (U)EFI Partition' ) )
        
        self.readGPT( efiPartition.firstLBA, next )
        
      },
      function setGPT( gpt, next ) {
        self.gpt = gpt
        next()
      },
    ], function( error ) {
      callback( error )
    })
    
    return this
    
  },
  
  readMBR: function( callback ) {
    
    var self = this
    
    this.device.readLBA( 0, 1, null, function( error, buffer, bytesRead ) {
      if( error != null )
        return void callback.call( self, error )
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
  
  readGPT: function( lba, callback ) {
    
    var self = this
    var gpt = new Disk.GPT({
      blockSize: this.device.blockSize
    })
    
    // Read the GPT's header
    this.device.readLBA(
      lba, lba + 1, null,
      function( error, buffer, bytesRead ) {
        
        if( error != null )
          return void callback.call( self, error )
        
        try {
          gpt.parseHeader( buffer )
        } catch( error ) {
          return void callback.call( self, error )
        }
        
        // Read the GPT's partition table
        self.device.readLBA(
          gpt.tableOffset,
          gpt.tableOffset + ( gpt.tableSize / gpt.blockSize ),
          null,
          function( error, buffer, bytesRead ) {
            
            if( error != null )
              return void callback.call( self, error )
            
            try {
              gpt.parseTable( buffer )
              callback.call( self, error, gpt )
            } catch( error ) {
              callback.call( self, error )
            }
            
          }
        )
        
      }
    )
    
    return this
    
  },
  
  verifyGPT: function( callback ) {
    
    var self = this
    
    if( this.gpt == null )
      return void callback.call( this, new Error( 'Missing GPT' ) )
    
    this.readGPT( this.gpt.backupLBA, function( error, backupGPT ) {
      if( error != null )
        return void callback.call( self, error )
      callback.call( self, self.gpt.verify( backupGPT ) )
    })
    
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
