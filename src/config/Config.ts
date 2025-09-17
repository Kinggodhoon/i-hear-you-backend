import { Configuration, SupportedEnvironment } from './Configuration';
import Development from './Development';
import Production from './Production';

export default class Config {
  private static config: Configuration

  public static getConfig(): Configuration {
    if (!this.config) {
      console.log(process.env.NODE_ENV)
      switch (process.env.NODE_ENV) {
        case SupportedEnvironment.production:
          this.config = Production;
          break;
        case SupportedEnvironment.development:
          this.config = Development;
          break;
        default:
          this.config = Development;
      }
    }

    return this.config;
  }

  public static isProduction(): boolean {
    return Config.getConfig().ENV === 'prod';
  }
}
