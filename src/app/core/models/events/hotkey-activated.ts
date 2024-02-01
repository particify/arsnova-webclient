export class HotkeyActivated {
  type: string;
  payload: {
    count: number;
  };

  constructor(count: number) {
    this.type = 'HotkeyActivated';
    this.payload = {
      count: count,
    };
  }
}
