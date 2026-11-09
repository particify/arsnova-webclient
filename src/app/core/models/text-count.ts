export class TextCount {
  text: string;
  count: number;
  id?: string;

  constructor(text: string, count: number, id?: string) {
    this.text = text;
    this.count = count;
    this.id = id;
  }
}
