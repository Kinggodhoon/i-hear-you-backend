import express from 'express';

import Controller from '../controller';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';

import { TempRequest, TempRequestModel, TempResponseModel } from './model/temp.model';
import TempService from './temp.service';
import { HttpRequest, RequestWithUser } from '../../types/request';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { ApiContoller } from '../../decorator/swagger/api-controller';

@ApiContoller('temp')
class TempController extends Controller {
  public readonly path = '/temp';

  private tempService: TempService;

  constructor() {
    super();
    this.initializeRoutes();

    this.tempService = new TempService();
  }

  private initializeRoutes() {
    // with auth
    this.router.get(`${this.path}/auth`, parameterValidate(TempRequest), this.withAuthTemp, response);

    // without auth
    this.router.post(`${this.path}/temp/{testNum}`, parameterValidate(TempRequest), this.temp, response);
  }

  @ApiEndpoint({
    path: 'auth',
    method: 'get',
    schema: {
      request: TempRequest,
      response: TempResponseModel,
    },
  })
  private withAuthTemp = async (
    req: RequestWithUser<TempRequest>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const params = req.requestParams;

      const ticket = await this.tempService.getTempTicket();

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          nonce: params.nonce,
          ticket,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }

  @ApiEndpoint({
    path: 'temp/{testNum}',
    method: 'post',
    schema: {
      request: TempRequestModel,
      response: TempResponseModel,
    },
  })
  private temp = async (
    req: HttpRequest<TempRequestModel>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const params = req.requestParams;

      const ticket = await this.tempService.getTempTicket();

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          nonce: params.nonce,
          ticket,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default TempController;
