import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

// AES-256-CBC, output as "ivHex:cipherHex". Used to store user-supplied AI provider
// keys at rest (AIConfig.encryptedKey) - never store plaintext API keys in the DB.
export function encrypt(plainText: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, dataHex] = encryptedText.split(':');
  if (!ivHex || !dataHex) {
    throw new Error('Malformed encrypted payload');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
