import { Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private title = signal<string>('');

  setTitle(title: string) {
    this.title.set(title);
  }

  getTitle(): Signal<string> {
    return this.title.asReadonly();
  }
}
