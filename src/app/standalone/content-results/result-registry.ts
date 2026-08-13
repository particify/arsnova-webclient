import { ContentType } from '@gql/generated/graphql';
import { ResultDefinition } from './result-definition';
import { ChoiceResultsComponent } from './choice-results/choice-results.component';
import { WordcloudResultsComponent } from './wordcloud-results/wordcloud-results.component';
import { FlashcardResultsComponent } from './flashcard-results/flashcard-results.component';
import { NumericResultsComponent } from './numeric-results/numeric-results.component';
import { PrioritizationResultsComponent } from './prioritization-results/prioritization-results.component';
import { ScaleResultsComponent } from './scale-results/scale-results.component';
import { ShortAnswerResultsComponent } from './short-answer-results/short-answer-results.component';
import { SortResultsComponent } from './sort-results/sort-results.component';
import { TextResultsComponent } from './text-results/text-results.component';

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
    component: NumericResultsComponent,
    supportsRoundComparison: true,
    supportsRounds: true,
  },
  [ContentType.Prioritization]: {
    component: PrioritizationResultsComponent,
  },
  [ContentType.Scale]: {
    component: ScaleResultsComponent,
    supportsRoundComparison: true,
    supportsRounds: true,
  },
  [ContentType.ShortAnswer]: {
    component: ShortAnswerResultsComponent,
  },
  [ContentType.Slide]: {},
  [ContentType.Sort]: {
    component: SortResultsComponent,
  },
  [ContentType.Text]: {
    component: TextResultsComponent,
  },
  [ContentType.Wordcloud]: {
    component: WordcloudResultsComponent,
    supportsRounds: true,
  },
};
