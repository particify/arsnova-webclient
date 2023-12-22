import { Injectable } from '@angular/core';

@Injectable()
export class ContentCarouselService {
  private lastContentAnswered = false;

  setLastContentAnswered(hasAnsweredLastContent: boolean) {
    this.lastContentAnswered = hasAnsweredLastContent;
  }

  isLastContentAnswered(): boolean {
    return this.lastContentAnswered;
  }
}
