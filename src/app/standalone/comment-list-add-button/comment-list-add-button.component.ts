import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FlexModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-comment-list-add-button',
  templateUrl: './comment-list-add-button.component.html',
  styleUrls: ['./comment-list-add-button.component.scss'],
})
export class CommentListAddButtonComponent {
  @Input() showButton = false;

  @Output() buttonClicked = new EventEmitter<void>();

  click() {
    this.buttonClicked.emit();
  }
}
