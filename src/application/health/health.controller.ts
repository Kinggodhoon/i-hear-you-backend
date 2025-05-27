import express from 'express';

import Controller from '../controller';
import { ApiContoller } from '../../decorator/swagger/api-controller';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { HealthRequest, HealthResponse } from './model/health.model';

@ApiContoller('health')
class HealthController extends Controller {
  public readonly path = '/health';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // auth
    this.router.get(`${this.path}`, this.checkHealth);
  }

  @ApiEndpoint({
    path: '',
    method: 'get',
    schema: {
      request: HealthRequest,
      response: HealthResponse,
    },
  })
  private checkHealth = async (req: express.Request, res: express.Response) => {
    res.status(200).json('OK');
  }
}

export default HealthController;
