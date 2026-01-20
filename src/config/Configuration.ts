export enum SupportedEnvironment {
  development = 'dev',
  production = 'production',
}

export interface Configuration {
  readonly ENV: string;
  readonly PORT: number;
  readonly cors: string | string[];

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

  readonly CDN_INFO: {
    baseUrl: string;
    metadataPath: string;
  }

  readonly QUIZMAP_ENCRYPT_KEY: string;
  readonly DISCORD_URI: string;
  readonly DISCORD_BOT_TOKEN: string;
}
