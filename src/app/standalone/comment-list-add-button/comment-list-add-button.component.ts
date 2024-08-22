import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';

@Component({
  standalone: true,
  imports: [
    FlexModule,
    TranslocoModule,
    MatButtonModule,
    MatIconModule,
    ExtensionPointModule,
  ],
  selector: 'app-comment-list-add-button',
  templateUrl: './comment-list-add-button.component.html',
  styleUrls: ['./comment-list-add-button.component.scss'],
})
export class CommentListAddButtonComponent {
  @Input() disabled = false;

  @Output() buttonClicked = new EventEmitter<void>();

  click() {
    this.buttonClicked.emit();
  }
}
