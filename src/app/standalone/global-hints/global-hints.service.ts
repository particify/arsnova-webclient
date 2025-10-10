import { Injectable, signal, computed } from '@angular/core';
import { GlobalHint } from './global-hint';

@Injectable({ providedIn: 'root' })
export class GlobalHintsService {
  private _hints = signal<GlobalHint[]>([]);
  readonly hints = computed(() => this._hints());

  addHint(hint: GlobalHint) {
    if (!this._hints().some((h) => h.id === hint.id)) {
      this._hints.update((current) => [...current, hint]);
    }
  }

  removeHint(id: string) {
    this._hints.update((current) => current.filter((h) => h.id !== id));
  }
}
