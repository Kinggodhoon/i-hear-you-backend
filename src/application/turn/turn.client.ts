import axios from 'axios';

import { MeteredCredential, TurnIceServer } from './model/turn.model';
import { HttpException } from '../../types/exception';

import { loggingError } from '../logger/logger';
import Config from '../../config/Config';

class TurnClient {
  public generateCrendential = async (): Promise<MeteredCredential | null> => {
    try {
      const meteredInfo = Config.getConfig().METERED_INFO;

      const response = await axios.post(`${meteredInfo.baseUrl}/credential?secretKey=${meteredInfo.secretKey}`, {
        expiryInSeconds: meteredInfo.expiryInSeconds,
      });

      return response.data as MeteredCredential;
    } catch (err) {
      loggingError('generateCredential', err as HttpException);
      return null
    }
  }

  public getTurnServerList = async (apiKey: string): Promise<Array<TurnIceServer> | null> => {
    try {
      const meteredInfo = Config.getConfig().METERED_INFO;

      const response = await axios.get(`${meteredInfo.baseUrl}/credentials?apiKey=${apiKey}`);

      return response.data as Array<TurnIceServer>;
    } catch (err) {
      console.log(err)
      loggingError('getTurnServerList', err as HttpException);
      return null
    }
  };
}

export default TurnClient;
