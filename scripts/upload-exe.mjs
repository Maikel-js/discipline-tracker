import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const {
  R2_ACCOUNT_ID = '',
  R2_ACCESS_KEY_ID = '',
  R2_SECRET_ACCESS_KEY = '',
  R2_BUCKET = 'discipline-tracker',
  R2_PUBLIC_URL = '',
} = process.env;

const distDir = resolve('dist');

const exeFiles = readdirSync(distDir).filter(f => f.endsWith('.exe'));
if (exeFiles.length === 0) {
  console.error('✗ No se encontró .exe en dist/');
  process.exit(1);
}
const filename = exeFiles[0];
const filePath = join(distDir, filename);

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const params = {
  Bucket: R2_BUCKET,
  Key: filename,
  Body: readFileSync(filePath),
  ContentType: 'application/x-msdownload',
  ContentDisposition: `attachment; filename="${filename}"`,
};

const command = new PutObjectCommand(params);
await client.send(command);
console.log('✓ Subido a Cloudflare R2');

const url = R2_PUBLIC_URL
  ? `${R2_PUBLIC_URL}/${filename}`
  : `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.dev/${filename}`;
console.log(`URL pública: ${url}`);
