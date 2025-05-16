import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormService } from '@app/core/services/util/form.service';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';

@Component({
  imports: [
    CommonModule,
    TranslocoModule,
    FlexModule,
    MatButtonModule,
    MatIconModule,
    LoadingButtonComponent,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-comment-settings-hint',
  templateUrl: './comment-settings-hint.component.html',
  styleUrls: ['./comment-settings-hint.component.scss'],
})
export class CommentSettingsHintComponent {
  private formService = inject(FormService);

  @Input() disabled = false;
  @Input() readonly = false;
  @Input() showToggleButton = false;

  @Output() toggleButtonClicked = new EventEmitter<void>();

  toggleSettings() {
    this.formService.disableForm();
    this.toggleButtonClicked.emit();
  }
}
