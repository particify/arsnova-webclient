import { ContentType } from '@gql/generated/graphql';
import { FormDefinition } from './form-definition';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { WordcloudContentFormComponent } from './wordcloud-content-form/wordcloud-content-form.component';
import { FlashcardContentFormComponent } from './flashcard-content-form/flashcard-content-form.component';
import { SlideContentFormComponent } from './slide-content-form/slide-content-form.component';
import { NumericContentFormComponent } from './numeric-content-form/numeric-content-form.component';
import { PrioritizationContentFormComponent } from './prioritization-content-form/prioritization-content-form.component';
import { ScaleContentFormComponent } from './scale-content-form/scale-content-form.component';
import { ShortAnswerContentFormComponent } from './short-answer-content-form/short-answer-content-form.component';
import { SortContentFormComponent } from './sort-content-form/sort-content-form.component';
import { TextContentFormComponent } from './text-content-form/text-content-form.component';

export const FORM_REGISTRY: Record<ContentType, FormDefinition> = {
  [ContentType.Choice]: {
    component: ChoiceContentFormComponent,
  },
  [ContentType.Binary]: {
    component: ChoiceContentFormComponent,
  },
  [ContentType.Flashcard]: {
    component: FlashcardContentFormComponent,
  },
  [ContentType.Numeric]: {
    component: NumericContentFormComponent,
  },
  [ContentType.Prioritization]: {
    component: PrioritizationContentFormComponent,
  },
  [ContentType.Scale]: {
    component: ScaleContentFormComponent,
  },
  [ContentType.ShortAnswer]: {
    component: ShortAnswerContentFormComponent,
  },
  [ContentType.Slide]: {
    component: SlideContentFormComponent,
  },
  [ContentType.Sort]: {
    component: SortContentFormComponent,
  },
  [ContentType.Text]: {
    component: TextContentFormComponent,
  },
  [ContentType.Wordcloud]: {
    component: WordcloudContentFormComponent,
  },
};
