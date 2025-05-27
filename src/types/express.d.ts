import { HttpException } from './exception';

export interface ResponseData {
  code?: number,
  message?: string,
  data?: any,
}

declare global {
  namespace Express {
    interface Request {
      requestParams: any,
      user: {
        userId: string,
      },
    }

    interface Response {
      responseData: ResponseData,
      responseError: HttpException | any | unknown,
    }
  }
}
