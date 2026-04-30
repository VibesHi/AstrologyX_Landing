/**
 * Regenerates public/img/app-store-qr.png — QR only, transparent background.
 * Keep URL in sync with src/config.ts (APP_STORE_URL).
 */
import QRCode from 'qrcode';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const APP_STORE_URL = 'https://apps.apple.com/app/id1449148271';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../public/img/app-store-qr.png');

const buf = await QRCode.toBuffer(APP_STORE_URL, {
  type: 'png',
  width: 512,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000ff',
    light: '#00000000',
  },
});

await writeFile(outPath, buf);
console.log('Wrote', outPath, `(${buf.length} bytes)`);
