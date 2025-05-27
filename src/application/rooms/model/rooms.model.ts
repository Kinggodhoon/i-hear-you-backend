import {
  IsDefined, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ResponseProperty } from '../../../decorator/swagger/api-response-property';
import { JsonParse } from '../../../decorator/validate/json-parser';

class WebRtcSdpOffer {
  @IsDefined()
  @IsString()
  type: string;

  @IsDefined()
  @IsString()
  sdp: string;
}

class WebRtcCandidateInfo {
  @IsDefined()
  @IsString()
  candidate: string;

  @IsDefined()
  @IsString()
  sdpMid: string;

  @IsDefined()
  @IsNumber()
  sdpMLineIndex: number;

  @IsDefined()
  @IsString()
  usernameFragment: string;
}

class WebRtcCandidate {
  @IsDefined()
  @IsString()
  type: string;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => WebRtcCandidateInfo)
  candidate: WebRtcCandidateInfo
}

export class WebRtcConnection {
  @IsDefined()
  @ValidateNested()
  @Type(() => WebRtcSdpOffer)
  sdpOffer: WebRtcSdpOffer

  @IsDefined()
  @ValidateNested()
  @Type(() => WebRtcCandidate)
  localCandidate: WebRtcCandidate

  @IsDefined()
  @ValidateNested()
  @Type(() => WebRtcCandidate)
  publicCandidate: WebRtcCandidate
}

export class EnterRoomRequest {
  @IsString()
  @IsDefined()
  public roomId: string;
}

export class EnterRoomResponse {
  @ResponseProperty({ type: 'array', isRequired: true, description: 'player socket id list' })
  players: string[];
}

// export class EnterRoomRequest {
//   @IsString()
//   @IsDefined()
//   public roomId: string;

//   @IsDefined()
//   @JsonParse(WebRtcConnection)
//   @ValidateNested({ each: true })
//   @Type(() => WebRtcConnection)
//   webRtcConnection: WebRtcConnection;
// }

// export class EnterRoomResponse {
//   @ResponseProperty({ type: 'object', isRequired: true, description: 'Host Rtc Connection' })
//   webRtcConnection: WebRtcConnection;
// }

// export class CreateRoomRequest {
//   @IsDefined()
//   @ValidateNested({ each: true })
//   @Type(() => WebRtcConnection)
//   webRtcConnection: WebRtcConnection;
// }

// export class CreateRoomResponse {
//   @ResponseProperty({ type: 'string', isRequired: true, description: 'Room id' })
//   roomId: string;
// }
