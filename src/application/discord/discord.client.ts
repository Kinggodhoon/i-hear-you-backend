import axios from 'axios';
import FormData from 'form-data';
import { randomUUID } from 'crypto';

import { HttpException } from '../../types/exception';

import { loggingError } from '../logger/logger';
import Config from '../../config/Config';

class DiscordClient {
  public requestListingOnDiscord = async (file: Buffer, name: string): Promise<boolean> => {
    try {
      const form = new FormData();
      form.append(
        'payload_json',
        JSON.stringify({
          content: `New Listing Request: ${name}`,
        }),
      );
      form.append('files[0]', file, {
        filename: `${randomUUID()}.iger`,
        contentType: 'application/octet-stream',
      });

      const response = await axios.post(`${Config.getConfig().DISCORD_URI}`, form, {
        headers: {
          Authorization: `Bot ${Config.getConfig().DISCORD_BOT_TOKEN}`,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      return response.status === 200;
    } catch (err) {
      loggingError('requestListingOnDiscord', err as HttpException);
      return false;
    }
  }
}

export default DiscordClient;
