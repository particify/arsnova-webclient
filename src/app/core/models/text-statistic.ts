export class TextStatistic {
  answer: string;
  count: number;
  id?: string;

  constructor(answer: string, count: number, id?: string) {
    this.answer = answer;
    this.count = count;
    this.id = id;
  }
}
