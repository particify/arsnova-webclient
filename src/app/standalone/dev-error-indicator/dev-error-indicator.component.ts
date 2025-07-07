import { Component, computed, ErrorHandler, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadge } from '@angular/material/badge';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AppErrorHandler } from '@app/app-error-handler';

@Component({
  selector: 'app-dev-error-indicator',
  templateUrl: './dev-error-indicator.component.html',
  styleUrl: './dev-error-indicator.component.scss',
  imports: [MatBadge, MatIcon, MatIconButton],
})
export class DevErrorIndicatorComponent {
  private errorHandler = inject(ErrorHandler) as AppErrorHandler;
  private uiErrorCount$ = this.errorHandler.uiErrorCount$;
  private httpErrorCount$ = this.errorHandler.httpErrorCount$;
  uiErrorCount = toSignal(this.uiErrorCount$, { initialValue: 0 });
  httpErrorCount = toSignal(this.httpErrorCount$, { initialValue: 0 });
  errorCount = computed(() => this.uiErrorCount() + this.httpErrorCount());
}
