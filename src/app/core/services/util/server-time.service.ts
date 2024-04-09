import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServerTimeService {
  private _averageOffset = 0;
  private count = 0;

  get averageOffset() {
    return this._averageOffset;
  }

  public updateAverageOffset(newOffset: number) {
    this.count++;
    this._averageOffset =
      (this._averageOffset * (this.count - 1) + newOffset) / this.count;
  }

  public determineServerTime(): Date {
    return new Date(Date.now() + this.averageOffset);
  }
}
