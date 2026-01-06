export interface Quizmap {
  title: string;
  description: string;
  quizCount: number;
  thumbnail: string;
  downloadLink: string;
}

export class GetQuizmapsResponse {
  turnIceServerList: Array<Quizmap>
}
