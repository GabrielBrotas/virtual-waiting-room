import crypto from 'crypto';

export class TokenProvider {
  generateShaToken() {
    const sha256 = crypto.createHash('sha256');
    sha256.update(Math.random().toString());
    return sha256.digest('hex');
  }
}
