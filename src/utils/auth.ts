import { z } from 'zod';

export const AuthConfigSchema = z.object({
  type: z.enum(['basic', 'api_key']),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  headerName: z.string().optional()
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export interface AuthHeaders {
  [key: string]: string;
}

export class AuthManager {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.validate();
  }

  private validate(): void {
    if (this.config.type === 'basic') {
      if (!this.config.username || !this.config.password) {
        throw new Error('Username and password are required for basic authentication');
      }
    } else if (this.config.type === 'api_key') {
      if (!this.config.apiKey) {
        throw new Error('API key is required for API key authentication');
      }
    }
  }

  getHeaders(): AuthHeaders {
    const headers: AuthHeaders = {};

    if (this.config.type === 'basic') {
      const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (this.config.type === 'api_key') {
      const headerName = this.config.headerName || 'X-Api-Key';
      headers[headerName] = this.config.apiKey!;
    }

    return headers;
  }

  getAuthType(): string {
    return this.config.type;
  }
}

export function createAuthManager(config: AuthConfig): AuthManager {
  return new AuthManager(config);
}