import { Type } from '@angular/core';
import { ContentType } from '@gql/generated/graphql';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { ContentScaleParticipantComponent } from '@app/participant/content/content-scale-participant/content-scale-participant.component';
import { ContentTextParticipantComponent } from '@app/participant/content/content-text-participant/content-text-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';

export const FORMAT_REGISTRY: Record<ContentType, FormatDefinition> = {
  [ContentType.Choice]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Binary]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Flashcard]: {},
  [ContentType.Numeric]: {
    component: ContentNumericParticipantComponent,
  },
  [ContentType.Prioritization]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Scale]: {
    component: ContentScaleParticipantComponent,
  },
  [ContentType.ShortAnswer]: {
    component: ContentChoiceParticipantComponent,
  },
  [ContentType.Slide]: {},
  [ContentType.Sort]: {
    component: ContentChoiceParticipantComponent,
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
