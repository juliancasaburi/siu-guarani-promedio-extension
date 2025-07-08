const fs = require('fs-extra');
const path = require('path');

async function buildFirefox() {
  console.log('🔨 Building Firefox extension...');
  
  // Create dist directory
  const distDir = path.join(__dirname, '..', 'dist', 'firefox');
  await fs.ensureDir(distDir);
  
  // Clean previous build
  await fs.emptyDir(distDir);
  
  // Copy manifest
  const manifestSrc = path.join(__dirname, '..', 'manifest-firefox.json');
  const manifestDest = path.join(distDir, 'manifest.json');
  
  if (!await fs.pathExists(manifestSrc)) {
    throw new Error('manifest-firefox.json not found');
  }
  
  await fs.copy(manifestSrc, manifestDest);
  console.log('✓ Copied Firefox manifest');
  
  // Copy extension files
  const filesToCopy = [
    'content',
    'popup',
    'icons',
    'LICENSE',
    'README.md'
  ];
  
  for (const file of filesToCopy) {
    const src = path.join(__dirname, '..', file);
    const dest = path.join(distDir, file);
    
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠️  Warning: ${file} not found, skipping`);
    }
  }
  
  // Copy webextension-polyfill
  const polyfillSrc = path.join(__dirname, '..', 'node_modules', 'webextension-polyfill', 'dist');
  const polyfillDest = path.join(distDir, 'webextension-polyfill', 'dist');
  
  if (await fs.pathExists(polyfillSrc)) {
    await fs.copy(polyfillSrc, polyfillDest);
    console.log('✓ Copied webextension-polyfill');
  } else {
    throw new Error('webextension-polyfill not found. Run "npm install" first.');
  }
  
  console.log('🎉 Firefox extension built successfully!');
  console.log(`   Build location: ${distDir}`);
}

buildFirefox().catch((error) => {
  console.error('❌ Firefox build failed:', error.message);
  process.exit(1);
});
