const fs = require('fs');
const path = require('path');

// Simple PNG generator - creates minimal valid PNG files
function createMinimalPNG(width, height, color) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (compressed image data)
  const rawData = Buffer.alloc(width * height * 3 + height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      rawData[offset] = color.r;
      rawData[offset + 1] = color.g;
      rawData[offset + 2] = color.b;
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crc = require('zlib').crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Colors
const primaryColor = { r: 102, g: 126, b: 234 }; // #667eea
const whiteColor = { r: 255, g: 255, b: 255 };

// Generate files
fs.writeFileSync('icon.png', createMinimalPNG(1024, 1024, primaryColor));
fs.writeFileSync('splash.png', createMinimalPNG(1242, 2436, whiteColor));
fs.writeFileSync('adaptive-icon.png', createMinimalPNG(1024, 1024, primaryColor));
fs.writeFileSync('favicon.png', createMinimalPNG(48, 48, primaryColor));

console.log('Generated PNG files successfully!');
