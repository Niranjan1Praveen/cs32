const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Update these paths based on where your JSON files actually are
// Option A: If files are in parent directory (cs32 folder)
const files = [
  path.join(__dirname, '..', 'faqs-complete.json'),     // Goes up one level to cs32 folder
  path.join(__dirname, '..', 'metadata.json')          // Goes up one level to cs32 folder
];

// Option B: If files are in backend/seeds/data (uncomment this and comment Option A)
// const files = [
//   path.join(__dirname, 'seeds', 'data', 'faqs-complete.json'),
//   path.join(__dirname, 'seeds', 'data', 'metadata.json')
// ];

// Option C: If files are somewhere else, specify full paths
// const files = [
//   'C:\\Users\\nithi\\Desktop\\cs32\\faqs-complete.json',
//   'C:\\Users\\nithi\\Desktop\\cs32\\metadata.json'
// ];

let integrityContent = '# Integrity checksums for reproducible builds\n';
integrityContent += `# Generated: ${new Date().toISOString().split('T')[0]}\n`;
integrityContent += '# Verify with: sha256sum -c .integrity\n\n';

files.forEach(file => {
  try {
    const content = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    // Use just the filename in the integrity file (without the path)
    const fileName = path.basename(file);
    integrityContent += `${hash}  ${fileName}\n`;
    console.log(`✅ Processed: ${fileName}`);
  } catch (err) {
    console.error(`❌ File not found: ${file}`);
    console.error(`   Error: ${err.message}`);
  }
});

// Write the updated .integrity file
const integrityPath = path.join(__dirname, '.integrity');
fs.writeFileSync(integrityPath, integrityContent);
console.log('\n✅ Updated .integrity file at:', integrityPath);
console.log('\n📝 New integrity checksums:');
console.log(integrityContent);