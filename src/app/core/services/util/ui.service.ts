import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  setScrollbarWidthVariable() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    document.documentElement.style.setProperty(
      '--scrollbar-width',
      scrollbarWidth + 'px'
    );
    if (outer.parentNode) {
      outer.parentNode.removeChild(outer);
    }
  }
}
