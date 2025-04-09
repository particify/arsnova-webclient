import { Content } from '@app/core/models/content';
import { Subject } from 'rxjs';

export class ContentGroupPageService {
  private editedContent$ = new Subject<Content>();
  private createdContent$ = new Subject<Content>();

  updateEditedContent(content: Content) {
    this.editedContent$.next(content);
  }

  getEditedContent(): Subject<Content> {
    return this.editedContent$;
  }

  updateCreatedContent(content: Content) {
    this.createdContent$.next(content);
  }

  getCreatedContent(): Subject<Content> {
    return this.createdContent$;
  }
}
