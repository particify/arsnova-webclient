import { CreatorContentDetailsFragment } from '@gql/generated/graphql';
import { Subject } from 'rxjs';

export class QuestionnairePageService {
  private editedContent$ = new Subject<CreatorContentDetailsFragment>();
  private createdContent$ = new Subject<CreatorContentDetailsFragment>();

  updateEditedContent(content: CreatorContentDetailsFragment) {
    this.editedContent$.next(content);
  }

  getEditedContent(): Subject<CreatorContentDetailsFragment> {
    return this.editedContent$;
  }

  updateCreatedContent(content: CreatorContentDetailsFragment) {
    this.createdContent$.next(content);
  }

  getCreatedContent(): Subject<CreatorContentDetailsFragment> {
    return this.createdContent$;
  }
}
