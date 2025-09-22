export enum SupportedEnvironment {
  development = 'dev',
  production = 'production',
}

export interface Configuration {
  readonly ENV: string;
  readonly PORT: number;

  readonly REDIS_INFO: {
    host: string;
    port: number;
    password: string;
  }

  readonly METERED_INFO: {
    baseUrl: string;
    secretKey: string;
    expiryInSeconds: number;
  }
}
