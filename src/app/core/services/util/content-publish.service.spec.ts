import { TestBed } from '@angular/core/testing';
import {
  Content,
  Questionnaire,
  QuestionnairePublishingMode,
} from '@gql/generated/graphql';
import { ContentPublishService } from './content-publish.service';

describe('ContentPublishService', () => {
  let service: ContentPublishService;

  function questionnaire(
    publishingMode: QuestionnairePublishingMode,
    position?: number,
    published = true
  ) {
    return {
      published,
      publishingMode,
      publishedUpToContent:
        position === undefined ? null : ({ position } as Content),
    } as Questionnaire;
  }

  function isIndexPublished(q: Questionnaire, index: number) {
    return service.isIndexPublished(
      q.published,
      q.publishingMode,
      index,
      q.publishedUpToContent?.position ?? undefined
    );
  }

  beforeEach(() => {
    service = TestBed.inject(ContentPublishService);
  });

  it('publishes nothing of an unpublished questionnaire', () => {
    const q = questionnaire(QuestionnairePublishingMode.All, undefined, false);

    expect(isIndexPublished(q, 0)).toBeFalse();
  });

  it('publishes every content in mode all', () => {
    const q = questionnaire(QuestionnairePublishingMode.All);

    expect(isIndexPublished(q, 4)).toBeTrue();
  });

  it('publishes up to and including the content of the range', () => {
    const q = questionnaire(QuestionnairePublishingMode.UpTo, 1);

    expect(isIndexPublished(q, 1)).toBeTrue();
    expect(isIndexPublished(q, 2)).toBeFalse();
  });

  it('publishes the first content when published up to it', () => {
    const q = questionnaire(QuestionnairePublishingMode.Live, 0);

    expect(isIndexPublished(q, 0)).toBeTrue();
    expect(isIndexPublished(q, 1)).toBeFalse();
  });

  it('publishes nothing of a range without a content', () => {
    const q = questionnaire(QuestionnairePublishingMode.UpTo);

    expect(isIndexPublished(q, 0)).toBeFalse();
  });
});
