var debug = require( 'debug' )( 'disk:partition' )

/**
 * Disk Partition
 * @constructor
 * @memberOf Disk
 * @return {Partition}
 */
function Partition( device, options ) {

  if( !(this instanceof Partition) )
    return new Partition( device, options )

  this.device = device

  this.firstLBA = options.firstLBA || 0
  this.lastLBA = options.lastLBA || -1

  debug( 'new', this.firstLBA, this.lastLBA )

}

/**
 * Partition Prototype
 * @type {Object}
 * @ignore
 */
Partition.prototype = {

  constructor: Partition,

  /**
   * Determine whether a LBA is within the partition's bounds
   * @internal
   * @param {Number} lba
   * @return {Boolean}
   */
  __OOB: function( lba ) {
    return lba < this.firstLBA ||
      lba > this.lastLBA
  },

  get blockSize() {
    return this.device.blockSize
  },

  get sectors() {
    return this.lastLBA - this.firstLBA
  },

  get size() {
    return this.sectors * this.blockSize
  },

  /**
   * Read from a LBA to another LBA
   * @param {Number} from
   * @param {Number} to
   * @param {Buffer} [buffer]
   * @param {Function} callback
   * @return {Partition}
   */
  readBlocks: function( from, to, buffer, callback ) {

    if( typeof buffer === 'function' ) {
      callback = buffer
      buffer = null
    }

    callback = callback.bind( this )

    from = from + this.firstLBA
    to = to + this.firstLBA

    if( this.__OOB( from ) || this.__OOB( to ) ) {
      var msg = 'Block address out of bounds: ' +
        '[' + from + ',' + to + '] not in range ' +
        '[' + this.firstLBA + ',' + this.lastLBA + ']'
      return callback( new Error( msg ) )
    }

    this.device.readBlocks( from, to, buffer, callback )

    return this

  },

  /**
   * Write a buffer to a given LBA
   * @param {Number} from
   * @param {Buffer} [buffer]
   * @param {Function} callback
   * @return {Partition}
   */
  writeBlocks: function( from, buffer, callback ) {

    callback = callback.bind( this )

    from = from + this.firstLBA

    if( this.__OOB( from ) ) {
      var msg = 'Block address out of bounds: ' +
        '[' + from + ',' + to + '] not in range ' +
        '[' + this.firstLBA + ',' + this.lastLBA + ']'
      return callback( new Error( msg ) )
    }

    this.device.writeBlocks( from, buffer, callback )

    return this

  },

}

// Exports
module.exports = Partition
