import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    FlexModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-comment-settings-hint',
  templateUrl: './comment-settings-hint.component.html',
  styleUrls: ['./comment-settings-hint.component.scss'],
})
export class CommentSettingsHintComponent {
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() showToggleButton = false;

  @Output() toggleButtonClicked = new EventEmitter<void>();

  toggleSettings() {
    this.toggleButtonClicked.emit();
  }
}
