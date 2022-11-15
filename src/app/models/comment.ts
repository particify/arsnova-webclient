import { CorrectWrong } from './correct-wrong.enum';

export class Comment {
  id: string;
  roomId: string;
  creatorId: string;
  revision: string;
  body: string;
  read: boolean;
  correct: CorrectWrong;
  favorite: boolean;
  timestamp: Date;
  score: number;
  createdFromLecturer: boolean;
  highlighted: boolean;
  ack: boolean;
  tag: string;
  answer: string;

  constructor(roomId = '',
              creatorId = '',
              body = '',
              read = false,
              correct: CorrectWrong = CorrectWrong.NULL,
              favorite = false,
              creationTimestamp: Date = null,
              score = 0,
              createdFromLecturer = false,
              highlighted = false,
              ack = true,
              tag = '',
              answer = '') {
    this.id = '';
    this.roomId = roomId;
    this.creatorId = creatorId;
    this.revision = '';
    this.body = body;
    this.read = read;
    this.correct = correct;
    this.favorite = favorite;
    this.timestamp = creationTimestamp;
    this.score = score;
    this.createdFromLecturer = createdFromLecturer;
    this.highlighted = highlighted;
    this.ack = ack;
    this.tag = tag;
    this.answer = answer;
  }
}
