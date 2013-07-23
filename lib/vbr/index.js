
/**
 * VBR constructor
 * @param {Buffer} buffer
 */
function VBR( buffer ) {
  
  if( !(this instanceof VBR) )
    return new VBR( buffer )
  
  // No JMP to bootloader code -> no VBR
  if( buffer[0] !== 0xEB && buffer[0] !== 0xE9 )
    return new Error( 'No VBR detected' );
  
  // 0x20 padded OEM/System name
  this.systemName = buffer.slice( 0x03, 0x03 + 0x08 )
    .toString( 'ascii' ).trim()
  
  this.type = buffer.slice( 0x15, 0x16 )
  
  this.bytesPerSector    = buffer.readUInt16LE( 0x0B )
  this.sectorsPerCluster = buffer.readUInt8( 0x0D )
  this.sectorSize        = this.bytesPerSector * this.sectorsPerCluster
  this.numberOfFATs      = buffer.readUInt8( 0x10 )
  this.maxEntries        = buffer.readUInt8( 0x11 )
  this.sectorsPerFAT     = buffer.readUInt16LE( 0x16 )
  this.sectorsPerTrack   = buffer.readUInt16LE( 0x18 )
  this.headsPerTrack     = buffer.readUInt16LE( 0x1A )
  this.hiddenSectors     = buffer.readUInt16LE( 0x1C )
  this.reservedSectors   = buffer.readUInt16LE( 0x0E )
  
  this.sectors = buffer.readUInt16LE( 0x13 ) ||
    buffer.readUInt16LE( 0x20 )
  
}

// Exports
module.exports = VBR

/**
 * VBR prototype
 * @type {Object}
 */
VBR.prototype = {
  
  constructor: VBR
  
}
