import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexModule],
  selector: 'app-comment-list-hint',
  templateUrl: './comment-list-hint.component.html',
})
export class CommentListHintComponent {
  @Input() noPostsFound: boolean;
  @Input() isListEmpty: boolean;
}
