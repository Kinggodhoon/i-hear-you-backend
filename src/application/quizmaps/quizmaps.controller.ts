import express from 'express';
import { validate } from 'class-validator';

import Controller from '../controller';
import response from '../../middleware/response';

import CacheService from '../../cache/cache.service';
import { HttpRequest } from '../../types/request';
import { ApiEndpoint } from '../../decorator/swagger/api-endpoint';
import { ApiContoller } from '../../decorator/swagger/api-controller';
import { HttpException } from '../../types/exception';

import { loggingError } from '../logger/logger';
import { GetQuizmapListingResponse } from './model/quizmaps.model';
import QuizmapsClient from './quizmaps.client';
import QuizmapsService from './quizmaps.service';
import { uploadIgerFileFilter } from '../../utils/file';
import DiscordClient from '../discord/discord.client';

@ApiContoller('Quizmaps')
class QuizmapsController extends Controller {
  public readonly path = '/quizmaps';

  private quizmapsClient: QuizmapsClient;
  private quizmapsService: QuizmapsService;
  private cacheService: CacheService;
  private discordClient: DiscordClient;

  constructor() {
    super();
    this.initializeRoutes();

    this.quizmapsClient = new QuizmapsClient();
    this.quizmapsService = new QuizmapsService();
    this.discordClient = new DiscordClient();
    CacheService.getInstance().then((instance) => {
      this.cacheService = instance;
    });
  }

  private initializeRoutes() {
    // get quizmap list
    this.router.get(`${this.path}`, this.getQuizmaps, response);
    this.router.post(`${this.path}`, uploadIgerFileFilter.single('quizmap'), this.uploadQuizmapFile, response)
  }

  @ApiEndpoint({
    path: 'quizmaps',
    method: 'get',
    schema: {
      request: null,
      response: GetQuizmapListingResponse,
    },
  })
  private getQuizmaps = async (
    req: HttpRequest<null>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const plainQuizmapListing = await this.cacheService.getQuizmapListing();
      // fast return for exists cache
      if (plainQuizmapListing) {
        res.responseData = {
          code: 200,
          message: 'Success',
          data: {
            quizmaps: JSON.parse(plainQuizmapListing),
          },
        }

        return next();
      }

      const quizmapListing = await this.quizmapsClient.getQuizmaps();
      if (!quizmapListing) throw new HttpException(500, 'Internal server error');

      // cache turn ice server list
      await this.cacheService.createQuizmapListing(quizmapListing);

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          quizmap: quizmapListing,
        },
      }
    } catch (error) {
      loggingError('getQuizmaps', error as HttpException);
      res.responseError = error;
    }
    return next();
  }

  @ApiEndpoint({
    path: 'quizmaps',
    method: 'post',
    schema: {
      request: null,
      response: GetQuizmapListingResponse,
    },
  })
  private uploadQuizmapFile = async (
    req: HttpRequest<null>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      // invalid file fast return
      if (!req.file) throw new HttpException(400, 'Invalid File Data');

      // decrypt .iger quizmap file
      const quizmapBuffer = req.file.buffer;
      const encrypted = quizmapBuffer.toString('utf-8');
      const quizmap = await this.quizmapsService.decryptQuiz(encrypted);

      // validate quizmap file
      const validateResult = await validate(quizmap);
      if (validateResult.length > 0) throw new HttpException(400, 'Invalid Quizmap');

      // upload to listing waiting queue
      const quizmapName = quizmap.title;
      const sendMessageResult = await this.discordClient.requestListingOnDiscord(quizmapBuffer, quizmapName)
      if (!sendMessageResult) throw new HttpException(500, 'Internal Server Error');

      res.responseData = {
        code: 200,
        message: 'Success',
        data: null,
      }
    } catch (error) {
      loggingError('getQuizmaps', error as HttpException);
      res.responseError = error;
    }
    return next();
  }
}

export default QuizmapsController;
