const { parseFile } = require('music-metadata');

async function test() {
  const mp3 = '/home/anthony/Music/spo/blue [MHCsrKA9gh8].mp3';
  console.log('Testing:', mp3);
  const metadata = await parseFile(mp3);
  
  console.log('\n=== ALL TXXX TAGS ===');
  if (metadata.native && metadata.native['ID3v2.3']) {
    for (const tag of metadata.native['ID3v2.3']) {
      if (tag.id.startsWith('TXXX')) {
        console.log('\nTag:', tag.id);
        console.log('Value:', JSON.stringify(tag.value).substring(0, 500));
      }
    }
  }
  
  console.log('\n=== CHECKING DESCRIPTION/COMMENT FOR LYRICS ===');
  if (metadata.native && metadata.native['ID3v2.3']) {
    for (const tag of metadata.native['ID3v2.3']) {
      const val = typeof tag.value === 'string' ? tag.value : JSON.stringify(tag.value);
      if (val.length > 100) {
        console.log('\nLong tag found:', tag.id);
        console.log('Length:', val.length);
        console.log('Preview:', val.substring(0, 200));
      }
    }
  }
}

test().catch(console.error);
