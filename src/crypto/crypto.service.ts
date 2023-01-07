import {
  createHmac,
  createSign,
  createVerify,
  generateKeyPairSync,
} from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';

@Injectable()
export class CryptoService {
  constructor(private config: ConfigService) {
    this.encryptionAlgorithm = 'sha256';
    this.cipherAlgorithm = 'aes-256-cbc';
  }

  private encryptionAlgorithm: string;
  private cipherAlgorithm: string;

  public generateKeyPairs() {}

  public createHMACString(data: string) {
    const HMAC = createHmac(
      this.encryptionAlgorithm,
      this.config.get<string>('SECRET'),
    );

    return HMAC.update(data).digest('hex');
  }

  public verifyHMAC(hash: string, plain: string) {
    const hashedPlain = this.createHMACString(plain);

    return hashedPlain === hash;
  }

  public generateKeyPair() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: this.cipherAlgorithm,
        passphrase: this.config.get<string>('SECRET'),
      },
    });

    return { publicKey, privateKey };
  }

  public createSignedString(
    data: string,
    config: { privateKey: string; publicKey: string },
  ) {
    const signer = createSign(this.encryptionAlgorithm);

    signer.write(data);
    signer.end();

    return {
      signature: signer.sign(
        {
          key: config.privateKey,
          passphrase: this.config.get<string>('SECRET'),
        },
        'hex',
      ),
      publicKey: config.publicKey,
    };
  }

  public verifySignedString(
    plain: string,
    signature: string,
    publicKey: string,
  ) {
    const verifier = createVerify(this.encryptionAlgorithm);

    verifier.write(plain);
    verifier.end();

    return verifier.verify(publicKey, signature, 'hex');
  }
}
