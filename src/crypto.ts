import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const keyByteLength = 32;
const ivByteLength = 16;

function getKeyAndIvFromPassword(password: string): { key: Buffer; iv: Buffer } {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  const digest = hash.digest();
  return {
    key: digest,
    iv: digest.slice(keyByteLength - ivByteLength, keyByteLength),
  };
}

export function encryptContent(content: string, password: string): string {
  const { key, iv } = getKeyAndIvFromPassword(password);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptContent(encrypted: string, password: string): string {
  const { key, iv } = getKeyAndIvFromPassword(password);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
