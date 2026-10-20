import { ContentType } from '@gql/generated/graphql';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { FORMAT_REGISTRY } from './format-registry';

describe('FORMAT_REGISTRY', () => {
  const formatsWithoutComponent = [ContentType.Flashcard, ContentType.Slide];

  /** Binary is a choice content; Prioritization and Sort still lack their own. */
  const formatsUsingTheChoiceComponent = [
    ContentType.Binary,
    ContentType.Choice,
    ContentType.Prioritization,
    ContentType.Sort,
  ];

  it('has no participant component for Flashcard and Slide', () => {
    formatsWithoutComponent.forEach((format) => {
      expect(FORMAT_REGISTRY[format].component)
        .withContext(`${format} unexpectedly has a participant component`)
        .toBeUndefined();
    });
  });

  it('has a participant component for every other format', () => {
    Object.values(ContentType)
      .filter((format) => !formatsWithoutComponent.includes(format))
      .forEach((format) => {
        expect(FORMAT_REGISTRY[format].component)
          .withContext(`${format} is missing a participant component`)
          .toBeDefined();
      });
  });

  it('falls back to the choice component only for the choice-like formats', () => {
    Object.values(ContentType).forEach((format) => {
      expect(
        FORMAT_REGISTRY[format].component === ContentChoiceParticipantComponent
      )
        .withContext(`${format} had an unexpected participant component`)
        .toBe(formatsUsingTheChoiceComponent.includes(format));
    });
  });

  it('has its own participant component for the short answer format', () => {
    expect(FORMAT_REGISTRY[ContentType.ShortAnswer].component).toBe(
      ContentShortAnswerParticipantComponent
    );
  });
});
