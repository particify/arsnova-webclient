import { Injectable } from '@angular/core';

const SCALE_FACTOR = 1000;
const MIN_SCALE = 1;
const MAX_SCALE = 1.9;

@Injectable()
export class PresentationService {

  constructor() {}

  getScale() {
    return Math.min(Math.max((innerWidth / SCALE_FACTOR), MIN_SCALE), MAX_SCALE);
  }
}
