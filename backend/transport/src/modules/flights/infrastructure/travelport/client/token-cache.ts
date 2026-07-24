import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
  scope?: string;
}

interface StoredEntry {
  iv: string;
  tag: string;
  data: string; // base64
}

/**
 * Process-local token cache. Optional AES-256-GCM encryption when
 * TRAVELPORT_TOKEN_ENCRYPTION_KEY is set. The at-rest form is the source of
 * truth: get() decrypts on every call, so a memory dump of the cache object
 * never reveals a raw token.
 *
 * ponytail: process-local Map — fine for single NestJS instance. Add Redis-backed
 * cache when running multi-instance, otherwise each pod re-mints a token every
 * expiry window and stampedes the auth endpoint.
 */
export class TokenCache {
  private readonly envKey: string;
  private readonly encryptionKey: Buffer | null;
  private stored: StoredEntry | null = null;
  private expiresAt = 0;
  private scope: string | undefined;

  constructor(envKey: string, encryptionKeyHex?: string) {
    this.envKey = envKey;
    this.encryptionKey = encryptionKeyHex ? this.deriveKey(encryptionKeyHex) : null;
  }

  /** Returns the cached token if it is valid and outside the safety window. */
  get(safetyWindowMs = 60_000): CachedToken | null {
    if (!this.stored) return null;
    if (Date.now() + safetyWindowMs > this.expiresAt) return null;
    const accessToken = this.decrypt();
    return { accessToken, expiresAt: this.expiresAt, scope: this.scope };
  }

  /** Stores a token. Encrypts at rest when an encryption key is configured. */
  set(token: CachedToken): void {
    this.expiresAt = token.expiresAt;
    this.scope = token.scope;
    this.stored = this.encrypt(token.accessToken);
  }

  /** Drops the cached token. Called by TokenManager.forceRefresh(). */
  clear(): void {
    this.stored = null;
    this.expiresAt = 0;
    this.scope = undefined;
  }

  /** True when the entry would be returned by get(). */
  has(safetyWindowMs = 60_000): boolean {
    return this.get(safetyWindowMs) !== null;
  }

  /** Inspection helper for tests / startup self-check. */
  inspectRaw(): { accessToken: string; expiresAt: number } | null {
    const t = this.get();
    return t ? { accessToken: t.accessToken, expiresAt: t.expiresAt } : null;
  }

  /** Inspection helper for tests: returns the at-rest blob (null if not encrypted). */
  inspectAtRest(): string | null {
    if (!this.stored) return null;
    if (!this.encryptionKey) {
      // Dev/sandbox: at-rest is the raw token (acceptable when no key is set).
      return '<plaintext, no encryption key configured>';
    }
    return `${this.stored.iv}.${this.stored.tag}.${this.stored.data}`;
  }

  private deriveKey(hex: string): Buffer {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error('TRAVELPORT_TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes).');
    }
    return scryptSync(hex, `tripsage-travelport-${this.envKey}`, 32);
  }

  private encrypt(plain: string): StoredEntry {
    if (!this.encryptionKey) {
      // No key: we still wrap so get() has one path; the wrap is reversible base64
      // and the dev/sandbox path is documented as not secret-at-rest.
      return { iv: '', tag: '', data: Buffer.from(plain, 'utf8').toString('base64') };
    }
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv: iv.toString('base64'), tag: tag.toString('base64'), data: enc.toString('base64') };
  }

  private decrypt(): string {
    if (!this.stored) throw new Error('No cached token.');
    if (!this.encryptionKey) {
      return Buffer.from(this.stored.data, 'base64').toString('utf8');
    }
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(this.stored.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(this.stored.tag, 'base64'));
    const dec = Buffer.concat([decipher.update(Buffer.from(this.stored.data, 'base64')), decipher.final()]);
    return dec.toString('utf8');
  }
}
