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
   * Mounts the given device and
   * attempts to read the MBR/GPT
   * @param  {Function} callback
   * @return {Disk}
   */
  mount: function( callback ) {
    
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
    
    async.waterfall([
      // Read the first 512 bytes
      // TODO: LBA 1 won't work if the block size
      // is less than 512 bytes!
      function readMBR( next ) {
        self.device.readLBA( 0, 1, null, next )
      },
      // Attempt to parse the MBR
      function parseMBR( buffer, bytesRead, next ) {
        try {
          self.mbr = new Disk.MBR( buffer )
          next( null, self.mbr )
        } catch( error ) {
          next( error )
        }
      },
    ], callback.bind( this ) )
    
    return this
    
  },
  
  readGPT: function( callback ) {
    
    var self = this
    
    async.waterfall([
      // Read the MBR first,
      // if it hasn't been already
      function readMBR( next ) {
        self.mbr == null ?
          void self.readMBR( next ) :
          void next( null, self.mbr )
      },
      function getEFIPart( mbr, next ) {
        var efiPartition = self.getEFIPart()
        efiPartition == null ?
          void next( new Error( 'Missing EFI Partition' ) ) :
          void next( null, efiPartition )
      },
      function readGPT( efiPartition, next ) {
        self.device.readLBA(
          efiPartition.firstLBA,
          efiPartition.firstLBA + 32,
          null, next
        )
      },
      function parseGPT( buffer, bytesRead, next ) {
        try {
          self.gpt = new Disk.GPT( buffer )
          next( null, self.gpt )
        } catch( error ) {
          next( error )
        }
      },
      // TODO: Fix up node-gpt, then fix up this mess
      // function readBackupGPT( gpt, next ) {
      //   self.device.readLBA(
      //     gpt.backupLBA - 32,
      //     gpt.backupLBA + 1,
      //     null, next
      //   )
      // },
      // function parseBackupGPT( buffer, bytesRead, next ) {
        
      //   var blockSize = self.device.blockSize
        
      //   buffer = Buffer.concat([
      //     buffer.slice( buffer.length - blockSize ),
      //     buffer.slice( 0, buffer.length - blockSize ),
      //   ])
        
      //   console.log( '' )
      //   console.log( 'Bytes read:', bytesRead )
      //   console.log( buffer.toString( 'hex' ).toUpperCase() )
      //   console.log( '' )
      //   try {
      //     var backupGPT = new Disk.GPT( buffer )
      //     console.log( backupGPT )
      //     next( null, backupGPT )
      //   } catch( error ) {
      //     next( error )
      //   }
      // },
      // function checkIntegrity( backupGPT, next ) {
        
      //   var error = null
      //   var result = null
        
      //   try { result = self.gpt.compare( backupGPT ) }
      //   catch( error ) { return next( error ) }
        
      //   switch( result ) {
      //     case Disk.GPT.DIFF.BOTH:
      //       error = new Error( 'Checksum mismatch' )
      //       break
      //     case Disk.GPT.DIFF.HEADER:
      //       error = new Error( 'Header checksum mismatch' )
      //       break
      //     case Disk.GPT.DIFF.TABLE:
      //       error = new Error( 'Partition table checksum mismatch' )
      //       break
      //   }
        
      //   next( error )
        
      // }
    ], callback.bind( this ))
    
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
  
  unmount: function( callback ) {
    callback = callback.bind( this )
    this.device.close( callback )
    return this
  },
  
}

// Exports
module.exports = Disk
