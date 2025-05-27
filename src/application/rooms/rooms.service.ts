import { v4 as uuid } from 'uuid';

class RoomsService {
  public generateRoomId = async (): Promise<string> => {
    const genUuid = uuid();
    const roomId = genUuid.split('-')[0];

    return roomId;
  };
}

export default RoomsService;
