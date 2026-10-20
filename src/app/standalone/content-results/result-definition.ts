import { Type } from '@angular/core';

export interface ResultDefinition {
  component: Type<unknown>;
  supportsRoundComparison?: boolean;
  /** Whether the backend allows starting another answer round. */
  supportsRounds?: boolean;
}
