import { Type } from '@angular/core';

export interface ResultDefinition {
  component: Type<unknown>;
  supportsRoundComparison?: boolean;
}
