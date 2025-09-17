import { HttpException, SocketException } from '../../types/exception';

export const loggingError = (controller: string, error: HttpException | SocketException) => {
  console.error('ERROR | ', {
    controller,
    code: error.code || 500,
    message: error.message,
  })
};
