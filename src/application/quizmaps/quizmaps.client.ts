import axios from 'axios';

import { HttpException } from '../../types/exception';

import { loggingError } from '../logger/logger';
import Config from '../../config/Config';
import { Quizmap } from './model/quizmaps.model';

class QuizmapsClient {
  public getQuizmaps = async (): Promise<Array<Quizmap> | null> => {
    try {
      const cdnInfo = Config.getConfig().CDN_INFO;

      const response = await axios.get(`${cdnInfo.baseUrl}/${cdnInfo.metadataPath}`);

      return response.data as Array<Quizmap>;
    } catch (err) {
      loggingError('getQuizmaps', err as HttpException);
      return null
    }
  }
}

export default QuizmapsClient;
