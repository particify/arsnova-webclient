import { Component, ErrorHandler, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadge } from '@angular/material/badge';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AppErrorHandler } from '@app/app-error-handler';

@Component({
  selector: 'app-dev-error-indicator',
  templateUrl: './dev-error-indicator.component.html',
  styleUrl: './dev-error-indicator.component.scss',
  imports: [MatBadge, MatIcon, MatIconButton, MatTooltip],
})
export class DevErrorIndicatorComponent {
  private errorHandler = inject(ErrorHandler) as AppErrorHandler;
  private uiErrorCount$ = this.errorHandler.uiErrorCount$;
  uiErrorCount = toSignal(this.uiErrorCount$, { initialValue: 0 });

  reset() {
    this.errorHandler.reset();
  }
}
