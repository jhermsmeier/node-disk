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
  
  readBackupGPT: function( callback ) {
    
    var self = this
    var efiPartition = self.getEFIPart()
    var backupGPT = new Disk.GPT({
      blockSize: this.device.blockSize
    })
    
    if( this.gpt == null ) {
      callback.call( this, new Error( 'Missing GUID Partition Table' ))
      return this
    }
    
    if( efiPartition == null ) {
      callback.call( this, new Error( 'Missing (U)EFI Partition' ))
      return this
    }
    
    // Read the backup GPT's header
    this.device.readLBA(
      this.gpt.backupLBA,
      this.gpt.backupLBA + 1,
      null,
      function( error, buffer, bytesRead ) {
        
        if( error != null )
          return void callback.call( self, error )
        
        try {
          backupGPT.parseHeader( buffer )
        } catch( error ) {
          return void callback.call( self, error )
        }
        
        // Read the backup GPT's partition table
        self.device.readLBA(
          backupGPT.tableOffset,
          backupGPT.tableOffset + ( backupGPT.tableSize / backupGPT.blockSize ),
          null,
          function( error, buffer, bytesRead ) {
            
            if( error != null )
              return void callback.call( self, error )
            
            try {
              backupGPT.parseTable( buffer )
              callback.call( self, error, backupGPT )
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
    
    this.readBackupGPT( function( error, backupGPT ) {
      if( error != null )
        callback.call( self, error )
      else
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
