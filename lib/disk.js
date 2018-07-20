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
 * @see https://github.com/jhermsmeier/node-mbr
 * @constructor
 */
Disk.MBR = require( 'mbr' )

/**
 * GUID Partition Table
 * @see https://github.com/jhermsmeier/node-gpt
 * @constructor
 */
Disk.GPT = require( 'gpt' )

Disk.Partition = require( './partition' )

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

    var done = callback.bind( this )

    this.mbr = null
    this.gpt = null
    this.partitions.length = 0

    debug( 'open' )

    var tasks = [
      // Step 1: Open handle
      ( next ) => {
        debug( 'open:device' )
        this.device.open( next )
      },
      // Step 2: Read Master Boot Record
      ( next ) => {
        debug( 'open:read_mbr' )
        this.readMBR( next )
      },
      // Step 3: Read GUID Partition Table Header
      // Step 4: Read GUID Partition Table
      // TODO: Read GUID Partition Table Backup
      // TODO: Verify GUID Partition Table against backup
      ( next ) => {
        debug( 'open:read_gpt' )
        this.readGPT(( error, gpt ) => {
          this.gpt = gpt
          next( error )
        })
      },
      // Step 5: Partitions
      ( next ) => {

        debug( 'open:init_partitions' )

        var addPartition = ( partition ) => {
          if( partition.firstLBA === 0 && partition.lastLBA === 0 )
            return void 0
          var part = this.partition( partition.firstLBA, partition.lastLBA )
          this.partitions.push( part )
        }

        if( this.gpt ) {
          this.gpt.partitions.forEach( addPartition )
        } else if( this.mbr ) {
          this.mbr.partitions.forEach( addPartition )
        }

        next()

      }
    ]

    var run = ( error ) => {
      if( error ) return callback.call( this, error )
      var task = tasks.shift()
      task ? task( run ) : callback.call( this )
    }

    run()

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
   * Create a bound-checked slice of the disk
   * @param {Number} fromLBA
   * @param {Number} toLBA
   * @return {Disk.Partition}
   */
  partition: function( fromLBA, toLBA ) {
    return new Disk.Partition( this.device, {
      firstLBA: fromLBA,
      lastLBA: toLBA,
    })
  },

  /**
   * Returns the EFI System Partition entry, if available
   * @return {MBR.Partition}
   */
  getEFIPart: function() {
    return this.mbr && this.mbr.getEFIPart()
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
        return done( null, null )
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
        lba = efiPart.firstLBA || 1
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

    var done = callback.bind( this )

    if( this.gpt == null || !(this.gpt instanceof Disk.GPT) ) {
      return done( new Error( 'Invalid or missing GPT' ) )
    }

    var headerBuffer = this.gpt.toBuffer( true, false )
    var tableBuffer = this.gpt.toBuffer( false, true )

    var header = Buffer.alloc( this.device.blockSize, 0 )
    var tableHeader = Buffer.alloc( this.device.blockSize, 0 )
    var table = Buffer.alloc( this.device.blockSize * 31, 0 )

    headerBuffer.copy( header )
    tableBuffer.slice( 0, this.gpt.entrySize * 4 ).copy( tableHeader )
    tableBuffer.slice( this.gpt.entrySize * 4 ).copy( table )

    // Last LBA of device (not user-space!)
    var lastLBA = ( this.device.size / this.device.blockSize ) - 1

    var tasks = [
      // Write the GPT header
      ( next ) => {
        var address = 1
        this.device.writeBlocks( address, header, next )
      },
      // Write the first 4 partition table entries
      ( next ) => {
        var address = 2
        this.device.writeBlocks( address, tableHeader, next )
      },
      // Write partition table entries 5-128
      ( next ) => {
        var address = 3
        this.device.writeBlocks( address, table, next )
      },
      // Write the backup GPT header
      ( next ) => {
        var address = this.gpt.backupLBA || lastLBA - 1
        this.device.writeBlocks( address, header, next )
      },
      // Write the first 4 backup partition table entries
      ( next ) => {
        var address = this.gpt.backupLBA ?
          this.gpt.backupLBA - 34 : lastLBA - 34
        this.device.writeBlocks( address, tableHeader, next )
      },
      // Write backup partition table entries 5-128
      ( next ) => {
        var address = this.gpt.backupLBA ?
          this.gpt.backupLBA - 33 : lastLBA - 33
        this.device.writeBlocks( address, table, next )
      },
    ]

    var run = ( error ) => {
      if( error ) return callback.call( this, error )
      var task = tasks.shift()
      task ? task( run ) : callback.call( this )
    }

    run()

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
