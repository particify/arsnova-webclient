import { ContentType } from '@gql/generated/graphql';
import { ResultDefinition } from './result-definition';
import { ChoiceResultsComponent } from './choice-results/choice-results.component';
import { WordcloudResultsComponent } from './wordcloud-results/wordcloud-results.component';
import { FlashcardResultsComponent } from './flashcard-results/flashcard-results.component';

export const RESULT_REGISTRY: Record<ContentType, ResultDefinition> = {
  [ContentType.Choice]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
    supportsRounds: true,
  },
  [ContentType.Binary]: {
    component: ChoiceResultsComponent,
    supportsRoundComparison: true,
  },
  [ContentType.Flashcard]: {
    component: FlashcardResultsComponent,
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
  [ContentType.Slide]: {},
  [ContentType.Sort]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Text]: {
    component: ChoiceResultsComponent,
  },
  [ContentType.Wordcloud]: {
    component: WordcloudResultsComponent,
    supportsRounds: true,
  },
};
