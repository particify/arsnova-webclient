import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const SCALE_FACTOR = 1000;
const MIN_SCALE = 1;
const MAX_SCALE = 1.9;

@Injectable()
export class PresentationService {

  currentGroup$ = new Subject<string>();

  constructor() {}

  getScale() {
    return Math.min(Math.max((innerWidth / SCALE_FACTOR), MIN_SCALE), MAX_SCALE);
  }

  getCurrentGroup(): Observable<string> {
    return this.currentGroup$;
  }

  updateCurrentGroup(group: string) {
    this.currentGroup$.next(group);
  }
}
