export interface MeteredCredential {
  username: string;
  password: string;
  expiryInSeconds: number;
  label?: string;
  apiKey: string;
}

export interface TurnIceServer {
  urls: string;
  username?: string;
  password?: string;
}

export class GetTurnResponse {
  turnIceServerList: Array<TurnIceServer>
}
