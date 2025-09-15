import express from 'express';

import Controller from '../controller';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';

import RoomsService from './rooms.service';
import CacheService from '../../cache/cache.service';
import { HttpRequest } from '../../types/request';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { ApiContoller } from '../../decorator/swagger/api-controller';
import { HttpException } from '../../types/exception';

import { EnterRoomRequest, EnterRoomResponse } from './model/rooms.model';

@ApiContoller('temp')
class RoomsController extends Controller {
  public readonly path = '/rooms';

  private roomsService: RoomsService;
  private cacheService: CacheService;

  constructor() {
    super();
    this.initializeRoutes();

    this.roomsService = new RoomsService();
    CacheService.getInstance().then((instance) => {
      this.cacheService = instance;
    });
  }

  private initializeRoutes() {
    // entering room
    this.router.get(`${this.path}/:roomId`, parameterValidate(EnterRoomRequest), this.getRoomId, response);
  }

  @ApiEndpoint({
    path: 'rooms/{roomId}',
    method: 'get',
    schema: {
      request: EnterRoomRequest,
      response: EnterRoomResponse,
    },
  })
  private getRoomId = async (
    req: HttpRequest<EnterRoomRequest>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const params = req.requestParams;

      const roomKey = await this.cacheService.getRoomKey(params.roomId);
      if (!roomKey) throw new HttpException(404, 'Not Found');
      const maxPlayer = +roomKey.split('|')[1];

      const players = await this.cacheService.getRoomPlayers(roomKey);
      if (players.length >= maxPlayer) {
        throw new HttpException(418, 'Room is full');
      }

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          players,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default RoomsController;
