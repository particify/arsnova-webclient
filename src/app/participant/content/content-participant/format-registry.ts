import { Type } from '@angular/core';
import { ContentType } from '@gql/generated/graphql';
import { ContentBinaryParticipantComponent } from '@app/participant/content/content-binary-participant/content-binary-participant.component';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { ContentPrioritizationParticipantComponent } from '@app/participant/content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentScaleParticipantComponent } from '@app/participant/content/content-scale-participant/content-scale-participant.component';
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ContentSortParticipantComponent } from '@app/participant/content/content-sort-participant/content-sort-participant.component';
import { ContentTextParticipantComponent } from '@app/participant/content/content-text-participant/content-text-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';

export const FORMAT_REGISTRY: Record<ContentType, FormatDefinition> = {
  [ContentType.Binary]: {
    component: ContentBinaryParticipantComponent,
  },
  [ContentType.Choice]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Flashcard]: {},
  [ContentType.Numeric]: {
    component: ContentNumericParticipantComponent,
  },
  [ContentType.Prioritization]: {
    component: ContentPrioritizationParticipantComponent,
  },
  [ContentType.Scale]: {
    component: ContentScaleParticipantComponent,
  },
  [ContentType.ShortAnswer]: {
    component: ContentShortAnswerParticipantComponent,
  },
  [ContentType.Slide]: {},
  [ContentType.Sort]: {
    component: ContentSortParticipantComponent,
  },
  [ContentType.Text]: {
    component: ContentTextParticipantComponent,
  },
  [ContentType.Wordcloud]: {
    component: ContentWordcloudParticipantComponent,
  },
};

interface FormatDefinition {
  component?: Type<unknown>;
}
