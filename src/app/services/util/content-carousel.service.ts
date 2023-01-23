import { Injectable } from '@angular/core';

@Injectable()
export class ContentCarouselService {
  private lastContentAnswered: boolean;

  setLastContentAnswered(hasAnsweredLastContent: boolean) {
    this.lastContentAnswered = hasAnsweredLastContent;
  }

  isLastContentAnswered(): boolean {
    return this.lastContentAnswered;
  }
}
