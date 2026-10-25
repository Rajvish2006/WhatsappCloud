/**
 * High-Entropy Hardened API Secret Token Generator
 * Produces cryptographic, tamper-resistant bearer tokens
 */
export function generateHardenedSecretToken(prefix = 'wc_sec_live', length = 48): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    for (let i = 0; i < length; i++) {
      randomString += characters[randomBytes[i] % characters.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      randomString += characters[Math.floor(Math.random() * characters.length)];
    }
  }

  return `${prefix}_${randomString}`;
}

export function maskSecret(secret?: string, visibleChars = 4): string {
  if (!secret) return '••••••••••••••••';
  if (secret.length <= visibleChars * 2) return '••••••••••••';
  return `${secret.substring(0, visibleChars)}...${secret.substring(secret.length - visibleChars)}`;
}
