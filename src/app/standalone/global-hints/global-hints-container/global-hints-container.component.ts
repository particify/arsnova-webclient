import {
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { GlobalHintsService } from '@app/standalone/global-hints/global-hints.service';
import { GlobalHintComponent } from '@app/standalone/global-hints/global-hint/global-hint.component';

@Component({
  selector: 'app-global-hints-container',
  imports: [GlobalHintComponent],
  templateUrl: './global-hints-container.component.html',
  styleUrls: ['./global-hints-container.component.scss'],
})
export class GlobalHintsContainerComponent {
  private service = inject(GlobalHintsService);
  hints = this.service.hints;
  container = viewChild<ElementRef<HTMLElement>>('globalHints');

  constructor() {
    effect(() => {
      this.hints();
      queueMicrotask(() => {
        const containerHeight =
          this.container()?.nativeElement.offsetHeight || 0;
        document.documentElement.style.setProperty(
          '--hints-height',
          `${containerHeight}px`
        );
        const newHeight = `calc(${CSS.supports('dvh') ? '100dvh' : '100vh'} - ${containerHeight}px)`;
        document.body.style.setProperty('--full-height', newHeight);
      });
    });
  }
}
