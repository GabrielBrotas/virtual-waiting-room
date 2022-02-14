import * as crypto from 'crypto';

export class TokenProvider {
  generateShaToken(value: string) {
    const sha256 = crypto.createHash('sha256');
    sha256.update(String(value));
    return sha256.digest('hex');
  }
}
