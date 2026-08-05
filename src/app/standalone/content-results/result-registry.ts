import { ContentType } from '@gql/generated/graphql';
import { ResultDefinition } from './result-definition';
import { ChoiceResultsComponent } from './choice-results/choice-results.component';
import { WordcloudResultsComponent } from './wordcloud-results/wordcloud-results.component';

export const RESULT_REGISTRY: Record<ContentType, ResultDefinition> = {
  [ContentType.Choice]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
  },
  [ContentType.Binary]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
  },
  [ContentType.Flashcard]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Numeric]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
  },
  [ContentType.Prioritization]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Scale]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
  },
  [ContentType.ShortAnswer]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
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
