import { Type } from '@angular/core';
import { ContentType } from '@gql/generated/graphql';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';

export const FORMAT_REGISTRY: Record<ContentType, FormatDefinition> = {
  [ContentType.Choice]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Binary]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Flashcard]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Numeric]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Prioritization]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Scale]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.ShortAnswer]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Slide]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Sort]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Text]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Wordcloud]: {
    component: ContentWordcloudParticipantComponent,
  },
};

interface FormatDefinition {
  component: Type<unknown>;
}
