import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';

@Component({
  standalone: true,
  imports: [CoreModule, LoadingIndicatorComponent],
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent extends FormComponent {
  @Input() name: string;
  @Input() isDialog = false;
  @Input() fullWidth = false;
  @Input() color = 'primary';
  @Input() aria?: string;
  @Input() hotkey?: string;
  @Input() hotkeyTitle?: string;
  @Input() hotkeyAction?: HotkeyAction;
  @Input() trackInteraction?: string;
  @Input() trackName?: string;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  loading = false;

  click() {
    this.loading = true;
    this.clicked.emit();
  }

  protected handleFormChanges(): void {
    if (!this.formDisabled) {
      this.loading = false;
    }
  }
}
