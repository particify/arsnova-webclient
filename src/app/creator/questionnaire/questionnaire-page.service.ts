import { Content } from '@gql/generated/graphql';
import { Subject } from 'rxjs';

export class QuestionnairePageService {
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
