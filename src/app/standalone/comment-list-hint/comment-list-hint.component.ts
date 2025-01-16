import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [TranslocoModule, FlexModule],
  selector: 'app-comment-list-hint',
  templateUrl: './comment-list-hint.component.html',
})
export class CommentListHintComponent {
  @Input() noPostsFound = false;
  @Input() isListEmpty = false;
}
