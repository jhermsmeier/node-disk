var async = require( 'async' )
var debug = require( 'debug' )( 'disk' )

/**
 * Disk
 * @class
 * @param {BlockDevice} device
 * @return {Disk}
 */
function Disk( device ) {
  
  if( !(this instanceof Disk) )
    return new Disk( device )
  
  /** @type {BlockDevice} Device */
  this.device = device
  /** @type {MBR} Master Boot Record */
  this.mbr = null
  /** @type {GPT} GUID Partition Table */
  this.gpt = null
  /** @type {BlockDevice.Partition[]} Partitions */
  this.partitions = []
  
}

/**
 * Master Boot Record
 * @type {Function}
 */
Disk.MBR = require( 'mbr' )

/**
 * GUID Partition Table
 * @type {Function}
 */
Disk.GPT = require( 'gpt' )

/**
 * Disk prototype
 * @type {Object}
 */
Disk.prototype = {
  
  constructor: Disk,
  
  /**
   * Opens a device handle and attempts
   * to read structures from disk
   * @param {Function} callback
   */
  open: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    this.mbr = null
    this.gpt = null
    this.partitions.length = 0
    
    debug( 'open' )
    
    async.waterfall([
      // Step 1: Open handle
      function open( next ) {
        debug( 'open:device' )
        self.device.open( next )
      },
      // Step 2: Read Master Boot Record
      function readMBR( fd, next ) {
        debug( 'open:read_mbr' )
        self.readMBR( next )
      },
      // Step 3: Read GUID Partition Table Header
      // Step 4: Read GUID Partition Table
      function readGPT( mbr, next ) {
        debug( 'open:read_gpt' )
        self.readGPT( next )
      },
      // Step 5: Partitions
      function initPartitions( gpt, next ) {
        
        debug( 'open:init_partitions' )
        
        self.gpt = gpt
        
        var addPartition = function( partition ) {
          if( partition.firstLBA === 0 && partition.lastLBA === 0 )
            return void 0
          var part = self.device.partition({
            firstLBA: partition.firstLBA,
            lastLBA: partition.lastLBA,
          })
          self.partitions.push( part )
        }
        
        if( self.gpt ) {
          self.gpt.partitions.forEach( addPartition )
        } else if( self.mbr ) {
          self.mbr.partitions.forEach( addPartition )
        }
        
        next()
        
      }
    ], done )
    
    return this
    
  },
  
  /**
   * Closes the device handle
   * @param {Function} callback
   */
  close: function( callback ) {
    var done = callback.bind( this )
    debug( 'close' )
    this.device.close( done )
    return this
  },
  
  /**
   * Returns the EFI System Partition entry, if available
   * @return {MBR.Partition}
   */
  getEFIPart: function() {
    
    if( this.mbr == null ) {
      return void 0
    }
    
    // NOTE: What if a MBR has more than one EFIPart entries?
    return this.mbr.partitions.filter( function( partition ) {
      return partition.type === 0xEE || partition.type === 0xEF
    })[0]
    
  },
  
  /**
   * Reads the Master Boot Record from disk
   * @param {Function} callback
   */
  readMBR: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    this.device.readBlocks( 0, 1, function( error, buffer ) {
      
      if( error != null ) {
        return done( error, null )
      }
      
      try {
        self.mbr = Disk.MBR.parse( buffer )
      } catch( e ) {
        // TODO: Use flags to communicate
        // what should be notices / warnings
        return done( e, null )
      }
      
      done( null, self.mbr )
      
    })
    
    return this
    
  },
  
  /**
   * Writes the Master Boot Record to disk
   * @param {Function} callback
   */
  writeMBR: function( callback ) {
    
    var done = callback.bind( this )
    var buffer = this.mbr.buffer
    
    this.device.writeBlocks( 0, buffer, done )
    
    return this
    
  },
  
  /**
   * Reads the GUID Partition Table from disk
   * @param {Function} callback
   */
  readGPT: function( lba, callback ) {
    
    var argv = Array.prototype.slice.call( arguments )
    
    callback = argv.pop()
    lba = argv.pop()
    
    var self = this
    var done = callback.bind( this )
    var gpt = null
    
    if( this.mbr == null ) {
      // TODO: Use flags to communicate what should be notices / warnings
      // new Error( 'Missing Master Boot Record' )
      return done( null, null )
    }
    
    if( lba == null ) {
      var efiPart = this.getEFIPart()
      if( efiPart ) {
        lba = efiPart.firstLBA
      } else {
        return done( null, null )
      }
    }
    
    debug( 'read_gpt', lba )
    
    // Step 1: Read GUID Partition Table Header
    this.device.readBlocks( lba, lba + 1, function( error, buffer ) {
      
      if( error != null ) {
        debug( 'read_gpt:error', e.message )
        return done( error, null )
      }
      
      // TODO: Use flags to communicate
      // what should be notices / warnings
      try {
        gpt = new Disk.GPT()
        gpt.parseHeader( buffer )
      } catch( e ) {
        debug( 'read_gpt:header:error', e.message )
        return done( null, null )
      }
      
      debug( 'read_gpt:header', gpt )
      
      // Step 2: Read GUID Partition Table
      self.device.readBlocks(
        gpt.tableOffset,
        gpt.tableOffset + ( gpt.tableSize / self.device.blockSize ),
        function( error, buffer ) {
          
          if( error != null ) {
            return done( error, null )
          }
          
          try {
            gpt.parseTable( buffer )
          } catch( e ) {
            // TODO: Use flags to communicate
            // what should be notices / warnings
            debug( 'read_gpt:table:error', e.message )
            return done( e, null )
          }
          
          debug( 'read_gpt:table', gpt.partitions )
          
          return done( null, gpt )
          
        }
      )
      
    })
    
    return this
    
  },
  
  /**
   * Writes the GUID Partition Table to disk
   * @param {Function} callback
   */
  writeGPT: function( callback ) {
    throw new Error( 'Not implemented' )
    return this
  },
  
  verifyGPT: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    if( this.gpt == null ) {
      debug( 'verify_gpt:missing' )
      done( new Error( 'Missing GPT' ) )
      return this
    }
    
    debug( 'verify_gpt', this.gpt.backupLBA )
    
    this.readGPT( this.gpt.backupLBA, function( error, backupGPT ) {
      error = error || self.gpt.verify( backupGPT )
      debug( 'verify_gpt:error', error.message )
      done( error, backupGPT )
    })
    
    return this
    
  },
  
}

// Exports
module.exports = Disk
