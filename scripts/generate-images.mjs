import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Generate OG image (1200x630)
const ogImageSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  
  <circle cx="150" cy="100" r="3" fill="#a89968" opacity="0.3"/>
  <circle cx="1050" cy="150" r="2" fill="#a89968" opacity="0.2"/>
  <circle cx="900" cy="550" r="2.5" fill="#a89968" opacity="0.25"/>
  <circle cx="250" cy="500" r="2" fill="#a89968" opacity="0.2"/>
  
  <text x="600" y="240" font-family="Arial, sans-serif" font-size="96" font-weight="700" fill="#f5e6d3" text-anchor="middle">AstrologyX</text>
  <text x="600" y="330" font-family="Arial, sans-serif" font-size="36" font-weight="400" fill="#c6c6c6" text-anchor="middle">Precision Astrology for iPhone</text>
  
  <line x1="300" y1="370" x2="900" y2="370" stroke="#a89968" stroke-width="2" opacity="0.6"/>
  
  <text x="600" y="480" font-family="Arial, sans-serif" font-size="28" fill="#9a9a9a" text-anchor="middle">Birth Chart - Daily Horoscope - Planetary Transits</text>
</svg>
`;

// Generate Apple touch icon (180x180)
const appleIconSvg = `
<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="180" height="180" fill="url(#iconGradient)" rx="39"/>
  
  <circle cx="90" cy="90" r="65" fill="none" stroke="#a89968" stroke-width="1.5" opacity="0.4"/>
  <circle cx="90" cy="90" r="55" fill="none" stroke="#a89968" stroke-width="1" opacity="0.3"/>
  
  <circle cx="90" cy="90" r="25" fill="none" stroke="#a89968" stroke-width="2"/>
  
  <circle cx="90" cy="35" r="2" fill="#a89968"/>
  <circle cx="135" cy="55" r="2" fill="#a89968"/>
  <circle cx="155" cy="90" r="2" fill="#a89968"/>
  <circle cx="135" cy="125" r="2" fill="#a89968"/>
  <circle cx="90" cy="145" r="2" fill="#a89968"/>
  <circle cx="45" cy="125" r="2" fill="#a89968"/>
  <circle cx="25" cy="90" r="2" fill="#a89968"/>
  <circle cx="45" cy="55" r="2" fill="#a89968"/>
  
  <circle cx="90" cy="90" r="3" fill="#a89968"/>
</svg>
`;

async function generateImages() {
  try {
    console.log('Generating og-image.png (1200x630)...');
    await sharp(Buffer.from(ogImageSvg))
      .png()
      .toFile(path.join(publicDir, 'og-image.png'));
    console.log('✓ og-image.png created');

    console.log('Generating apple-touch-icon.png (180x180)...');
    await sharp(Buffer.from(appleIconSvg))
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ apple-touch-icon.png created');

    console.log('\nAll images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages();
