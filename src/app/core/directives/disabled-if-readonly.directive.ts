import {
  afterRenderEffect,
  Directive,
  ElementRef,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { map } from 'rxjs';

@Directive({ selector: '[appDisabledIfReadonly]' })
export class DisabledIfReadonlyDirective {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private apiConfigService = inject(ApiConfigService);
  private readOnly = toSignal(
    this.apiConfigService.getApiConfig$().pipe(map((c) => c.readOnly)),
    { initialValue: true }
  );

  constructor() {
    afterRenderEffect({
      write: () => {
        const readOnly = this.readOnly();
        const el = this.elementRef.nativeElement;
        if (el instanceof HTMLButtonElement) {
          el.disabled = readOnly;
        } else {
          if (readOnly) {
            el.classList.add('disabled', 'disabled-interaction');
            el.ariaDisabled = 'true';
          } else {
            el.classList.remove('disabled', 'disabled-interaction');
            el.ariaDisabled = null;
          }
        }
      },
    });
  }
}
