import express from 'express';

import Controller from '../controller';
import response from '../../middleware/response';

import CacheService from '../../cache/cache.service';
import { HttpRequest } from '../../types/request';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { ApiContoller } from '../../decorator/swagger/api-controller';
import { HttpException } from '../../types/exception';

import { loggingError } from '../logger/logger';
import { GetQuizmapsResponse } from './model/quizmaps.model';
import QuizmapsClient from './quizmaps.client';

@ApiContoller('Quizmaps')
class QuizmapsController extends Controller {
  public readonly path = '/quizmaps';

  private quizmapsClient: QuizmapsClient;
  private cacheService: CacheService;

  constructor() {
    super();
    this.initializeRoutes();

    this.quizmapsClient = new QuizmapsClient();
    CacheService.getInstance().then((instance) => {
      this.cacheService = instance;
    });
  }

  private initializeRoutes() {
    // get quizmap list
    this.router.get(`${this.path}`, this.getQuizmaps, response);
  }

  @ApiEndpoint({
    path: 'quizmaps',
    method: 'get',
    schema: {
      request: null,
      response: GetQuizmapsResponse,
    },
  })
  private getQuizmaps = async (
    req: HttpRequest<null>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const plainQuizmaps = await this.cacheService.getQuizmaps();
      // fast return for exists cache
      if (plainQuizmaps) {
        res.responseData = {
          code: 200,
          message: 'Success',
          data: {
            quizmaps: JSON.parse(plainQuizmaps),
          },
        }

        return next();
      }

      const quizmaps = await this.quizmapsClient.getQuizmaps();
      if (!quizmaps) throw new HttpException(500, 'Internal server error');

      // cache turn ice server list
      await this.cacheService.createQuizmaps(quizmaps)

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          quizmaps,
        },
      }
    } catch (error) {
      loggingError('getQuizmaps', error as HttpException);
      res.responseError = error;
    }
    return next();
  }
}

export default QuizmapsController;
