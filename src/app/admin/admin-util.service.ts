import { Injectable } from '@angular/core';

@Injectable()
export class AdminUtilService {
  isUuid(input: string) {
    return /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(input);
  }
}
