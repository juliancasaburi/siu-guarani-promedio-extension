const archiver = require('archiver');
const fs = require('fs-extra');
const path = require('path');

async function createZip(sourceDir, outputPath, browserName) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { 
      zlib: { level: 9 },
      store: false // Enable compression
    });

    output.on('close', () => {
      console.log(`✓ ${browserName} extension zip created: ${outputPath} (${archive.pointer()} bytes)`);
      resolve();
    });

    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function validateBuild(buildDir, browserName) {
  const manifestPath = path.join(buildDir, 'manifest.json');
  
  if (!await fs.pathExists(manifestPath)) {
    throw new Error(`Missing manifest.json in ${browserName} build`);
  }

  const requiredDirs = ['content', 'popup'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(buildDir, dir);
    if (!await fs.pathExists(dirPath)) {
      throw new Error(`Missing required directory: ${dir} in ${browserName} build`);
    }
  }

  console.log(`✓ ${browserName} build validation passed`);
}

async function zipBuilds() {
  console.log('🚀 Creating extension packages...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  const chromeDir = path.join(distDir, 'chromium');
  const firefoxDir = path.join(distDir, 'firefox');

  // Validate builds exist
  if (!await fs.pathExists(chromeDir)) {
    throw new Error('Chrome/Chromium build not found. Run "npm run build:chrome" first.');
  }
  
  if (!await fs.pathExists(firefoxDir)) {
    throw new Error('Firefox build not found. Run "npm run build:firefox" first.');
  }

  // Validate build contents
  await validateBuild(chromeDir, 'Chrome');
  await validateBuild(firefoxDir, 'Firefox');

  // Create zip files
  const chromeZipPath = path.join(distDir, 'siu-guarani-promedio-chromium.zip');
  const firefoxZipPath = path.join(distDir, 'siu-guarani-promedio-firefox.zip');

  // Remove existing zips
  await fs.remove(chromeZipPath);
  await fs.remove(firefoxZipPath);

  // Create new zips
  await createZip(chromeDir, chromeZipPath, 'Chrome');
  await createZip(firefoxDir, firefoxZipPath, 'Firefox');
  
  console.log('🎉 All extension packages created successfully!');
  console.log('\nReady for distribution:');
  console.log(`  📦 Chromium based: dist/siu-guarani-promedio-chromium.zip`);
  console.log(`  📦 Firefox based:  dist/siu-guarani-promedio-firefox.zip`);
}

zipBuilds().catch((error) => {
  console.error('❌ Error creating packages:', error.message);
  process.exit(1);
});
