const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const originalPath = path.join(__dirname, '..', 'public', 'direskill_logo_original.jpg');
  const pubDir = path.join(__dirname, '..', 'public');

  const squareBase = sharp(originalPath)
    .extract({ left: 0, top: 91, width: 764, height: 764 });

  // 512x512
  await squareBase.clone().resize(512, 512).png().toFile(path.join(pubDir, 'icon-512.png'));
  // 192x192
  await squareBase.clone().resize(192, 192).png().toFile(path.join(pubDir, 'icon-192.png'));
  // 180x180 (apple touch icon)
  await squareBase.clone().resize(180, 180).png().toFile(path.join(pubDir, 'apple-touch-icon.png'));
  // direskill_icon.png
  await squareBase.clone().resize(512, 512).png().toFile(path.join(pubDir, 'direskill_icon.png'));

  // Also update SVG wrappers with embedded base64
  const b64_192 = fs.readFileSync(path.join(pubDir, 'icon-192.png')).toString('base64');
  const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <image href="data:image/png;base64,${b64_192}" width="192" height="192" />
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'icon-192.svg'), svg192);

  const b64_512 = fs.readFileSync(path.join(pubDir, 'icon-512.png')).toString('base64');
  const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${b64_512}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'icon-512.svg'), svg512);

  console.log('All PWA launching icons generated with authentic unremoved dark background.');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
