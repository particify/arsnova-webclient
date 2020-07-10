import {InjectionToken, Type} from '@angular/core';

export abstract class Extension {
  abstract getId(): string;
  abstract getType(): Type<any>;
}

export const EXTENSION = new InjectionToken<Extension>('extension');
