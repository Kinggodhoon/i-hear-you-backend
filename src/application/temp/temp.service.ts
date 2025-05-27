import { v4 as uuid } from 'uuid';

class TempService {
  public getTempTicket = async (): Promise<string> => {
    const ticket = uuid();

    return ticket;
  };
}

export default TempService;
