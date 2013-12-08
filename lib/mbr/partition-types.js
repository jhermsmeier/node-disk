module.exports = {
  
  0x00: [{ description: 'Unused entry' }],
  
  0x01: [{ fs: 'FAT12', type: 'filesystem', description: 'FAT12' }],
  
  0x02: [{ os: 'XENIX', description: 'XENIX root' }],
  0x03: [{ os: 'XENIX', description: 'XENIX usr' }],
  
  0x04: [{ fs: 'FAT16', type: 'filesystem', description: 'FAT16' }],
  
  0x05: [{ type: 'container', description: 'Extended Partition' }],
  
  0x06: [{ fs: 'FAT16B', type: 'filesystem', description: 'FAT16B' }],
  
  0xEE: [{ description: 'GPT, protective MBR' }],
  0xEF: [{ description: 'GPT, hybrid MBR' }],
  
  0x07: [
    { fs: 'IFS', os: 'OS/2' },
    { fs: 'HPFS', os: 'OS/2' },
    { fs: 'HPFS', os: 'Windows' },
    { fs: 'NTFS', os: 'Windows' },
    { fs: 'exFAT', os: 'Windows' },
  ],
  
  0xAB: [{ os: 'Mac OS', description: 'Apple Boot' }],
  0xAF: [{ fs: 'HFS', os: 'Mac OS' }],
  
}