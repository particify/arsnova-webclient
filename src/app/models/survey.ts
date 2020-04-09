export class Survey {
  state: number;
  name: string;
  label: string;
  a11y: string;
  count: number;

  constructor(state: number, name: string, label: string, a11y: string, count: number) {
    this.state = state;
    this.name = name;
    this.label = label;
    this.a11y = a11y;
    this.count = count;
  }
}
