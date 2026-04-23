import { ContentType } from '@gql/generated/graphql';
import { ResultDefinition } from './result-definition';
import { ChoiceResultsComponent } from './choice-results/choice-results.component';
import { WordcloudResultsComponent } from './wordcloud-results/wordcloud-results.component';

export const RESULT_REGISTRY: Record<ContentType, ResultDefinition> = {
  [ContentType.Choice]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Binary]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Flashcard]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Numeric]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Prioritization]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Scale]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.ShortAnswer]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Slide]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Sort]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Text]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Wordcloud]: {
    component: WordcloudResultsComponent,
  },
};
