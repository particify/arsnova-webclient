import { InputSignal, ModelSignal } from '@angular/core';

export interface ContentForm<T> {
  preview: InputSignal<boolean>;
  formatData: ModelSignal<T | null>;
  formatDataValid(): boolean;
  submit(questionnaireId: string, body: string): void;
}
