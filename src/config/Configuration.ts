export enum SupportedEnvironment {
  development = 'dev',
}

export interface Configuration {
  readonly ENV: string;
  readonly PORT: number;

  readonly REDIS_INFO: {
    host: string;
    port: number;
    password: string;
  }
}
