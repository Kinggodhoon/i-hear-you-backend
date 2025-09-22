import express from 'express';

import Controller from '../controller';
import response from '../../middleware/response';

import CacheService from '../../cache/cache.service';
import { HttpRequest } from '../../types/request';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { ApiContoller } from '../../decorator/swagger/api-controller';
import { HttpException } from '../../types/exception';

import { GetTurnResponse } from './model/turn.model';
import { loggingError } from '../logger/logger';
import TurnClient from './turn.client';

@ApiContoller('Turn')
class TurnController extends Controller {
  public readonly path = '/turn';

  private turnClient: TurnClient;
  private cacheService: CacheService;

  constructor() {
    super();
    this.initializeRoutes();

    this.turnClient = new TurnClient();
    CacheService.getInstance().then((instance) => {
      this.cacheService = instance;
    });
  }

  private initializeRoutes() {
    // entering room
    this.router.get(`${this.path}`, this.getTurnIceServer, response);
  }

  @ApiEndpoint({
    path: 'turn',
    method: 'get',
    schema: {
      request: null,
      response: GetTurnResponse,
    },
  })
  private getTurnIceServer = async (
    req: HttpRequest<null>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const plainTurnIceServers = await this.cacheService.getTurnIces();
      // fast return for exists cache
      if (plainTurnIceServers) {
        res.responseData = {
          code: 200,
          message: 'Success',
          data: {
            turnIceServerList: JSON.parse(plainTurnIceServers),
          },
        }

        return next();
      }

      const credential = await this.turnClient.generateCrendential();
      if (!credential) throw new HttpException(500, 'Internal server error');

      // get turn ice server list
      const turnIceServerList = await this.turnClient.getTurnServerList(credential.apiKey);
      if (!turnIceServerList) throw new HttpException(500, 'Internal server error');

      // cache turn ice server list
      await this.cacheService.createTurnIces(turnIceServerList!)

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          turnIceServerList: turnIceServerList!,
        },
      }
    } catch (error) {
      loggingError('getRoomId', error as HttpException);
      res.responseError = error;
    }
    return next();
  }
}

export default TurnController;
