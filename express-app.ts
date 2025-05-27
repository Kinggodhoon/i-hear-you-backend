import express from 'express';
import cors from 'cors';

import Config from './src/config/Config';
import CacheService from './src/cache/cache.service';

class ExpressApp {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = Config.getConfig().ENV;
    this.port = Config.getConfig().PORT;

    CacheService.getInstance();

    this.initializeMiddlewares();
    // this.initializeSwagger();
    // this.initializeErrorHandling();
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  // private initializeSwagger() {
  //   generateSwaggerDocs().then(() => {
  //     this.app.use(
  //       '/api-docs',
  //       expressBasicAuth({
  //         users: {
  //           nightworker: 'nightworker2023',
  //         },
  //         challenge: true,
  //       }),
  //       swaggerUi.serve,
  //       swaggerUi.setup(swaggerFile, { explorer: true }),
  //     );
  //   });
  // }

  // private initializeErrorHandling() {
  //   this.app.use(errorMiddleware);
  // }
}

export default ExpressApp;
