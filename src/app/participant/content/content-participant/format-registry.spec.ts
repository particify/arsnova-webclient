import { ContentType } from '@gql/generated/graphql';
import { ContentBinaryParticipantComponent } from '@app/participant/content/content-binary-participant/content-binary-participant.component';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentPrioritizationParticipantComponent } from '@app/participant/content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ContentSortParticipantComponent } from '@app/participant/content/content-sort-participant/content-sort-participant.component';
import { FORMAT_REGISTRY } from './format-registry';

describe('FORMAT_REGISTRY', () => {
  const formatsWithoutComponent = [ContentType.Flashcard, ContentType.Slide];

  const formatsUsingTheChoiceComponent = [ContentType.Choice];

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

  it('has its own participant component for the binary format', () => {
    expect(FORMAT_REGISTRY[ContentType.Binary].component).toBe(
      ContentBinaryParticipantComponent
    );
  });

  it('has its own participant component for the prioritization format', () => {
    expect(FORMAT_REGISTRY[ContentType.Prioritization].component).toBe(
      ContentPrioritizationParticipantComponent
    );
  });

  it('has its own participant component for the short answer format', () => {
    expect(FORMAT_REGISTRY[ContentType.ShortAnswer].component).toBe(
      ContentShortAnswerParticipantComponent
    );
  });

  it('has its own participant component for the sort format', () => {
    expect(FORMAT_REGISTRY[ContentType.Sort].component).toBe(
      ContentSortParticipantComponent
    );
  });
});
