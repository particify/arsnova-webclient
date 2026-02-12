export class ChallengeSolved {
  type: string;
  payload: {
    iterations: number;
    duration: number;
  };

  constructor(iterations: number, duration: number) {
    this.type = 'ChallengeSolved';
    this.payload = {
      iterations,
      duration,
    };
  }
}
