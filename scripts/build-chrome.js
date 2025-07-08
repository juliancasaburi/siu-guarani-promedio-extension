const fs = require('fs-extra');
const path = require('path');

async function buildChrome() {
  console.log('🔨 Building Chrome/Chromium extension...');
  
  // Create dist directory
  const distDir = path.join(__dirname, '..', 'dist', 'chromium');
  await fs.ensureDir(distDir);
  
  // Clean previous build
  await fs.emptyDir(distDir);
  
  // Copy manifest
  const manifestSrc = path.join(__dirname, '..', 'manifest-chrome.json');
  const manifestDest = path.join(distDir, 'manifest.json');
  
  if (!await fs.pathExists(manifestSrc)) {
    throw new Error('manifest-chrome.json not found');
  }
  
  await fs.copy(manifestSrc, manifestDest);
  console.log('✓ Copied Chrome/Chromium manifest');
  
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
  
  console.log('🎉 Chrome/Chromium extension built successfully!');
  console.log(`   Build location: ${distDir}`);
}

buildChrome().catch((error) => {
  console.error('❌ Chrome/Chromium build failed:', error.message);
  process.exit(1);
});
