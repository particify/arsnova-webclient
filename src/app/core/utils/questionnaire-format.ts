import { DisplayAnswer } from '@app/creator/questionnaire/content-editing/_models/display-answer';
import {
  ContentDetailsFragment,
  ContentType,
  QuestionnaireType,
} from '@gql/generated/graphql';

const CONTENT_TYPE_ICONS = new Map<ContentType, string>([
  [ContentType.Binary, 'rule'],
  [ContentType.Choice, 'list'],
  [ContentType.Flashcard, 'school'],
  [ContentType.Numeric, 'numbers'],
  [ContentType.Prioritization, 'sort'],
  [ContentType.Scale, 'mood'],
  [ContentType.ShortAnswer, 'sms'],
  [ContentType.Slide, 'info'],
  [ContentType.Sort, 'move_up'],
  [ContentType.Text, 'description'],
  [ContentType.Wordcloud, 'cloud'],
]);

const QUESTIONNAIRE_TYPE_ICONS = new Map<QuestionnaireType, string>([
  [QuestionnaireType.Mixed, 'dashboard'],
  [QuestionnaireType.Quiz, 'sports_esports'],
  [QuestionnaireType.Survey, 'tune'],
  [QuestionnaireType.Flashcards, 'school'],
]);

export function getContentTypeIcons(): ReadonlyMap<ContentType, string> {
  return CONTENT_TYPE_ICONS;
}

export function getQuestionnaireTypeIcons(): ReadonlyMap<
  QuestionnaireType,
  string
> {
  return QUESTIONNAIRE_TYPE_ICONS;
}

/** In the order they are offered to users, which is not alphabetical. */
export function getContentFormatsOfQuestionnaireType(
  questionnaireType: QuestionnaireType
): ContentType[] {
  switch (questionnaireType) {
    case QuestionnaireType.Mixed:
      return [
        ContentType.Choice,
        ContentType.Scale,
        ContentType.Binary,
        ContentType.Text,
        ContentType.ShortAnswer,
        ContentType.Wordcloud,
        ContentType.Sort,
        ContentType.Prioritization,
        ContentType.Numeric,
        ContentType.Flashcard,
        ContentType.Slide,
      ];
    case QuestionnaireType.Quiz:
      return [
        ContentType.Choice,
        ContentType.Binary,
        ContentType.ShortAnswer,
        ContentType.Sort,
        ContentType.Numeric,
        ContentType.Slide,
      ];
    case QuestionnaireType.Survey:
      return [
        ContentType.Choice,
        ContentType.Scale,
        ContentType.Binary,
        ContentType.Text,
        ContentType.Wordcloud,
        ContentType.Prioritization,
        ContentType.Numeric,
        ContentType.Slide,
      ];
    case QuestionnaireType.Flashcards:
      return [ContentType.Flashcard, ContentType.Slide];
    default:
      return [];
  }
}

export function isContentCompatibleWithQuestionnaireType(
  content: ContentDetailsFragment,
  questionnaireType: QuestionnaireType
): boolean {
  if (
    !getContentFormatsOfQuestionnaireType(questionnaireType).includes(
      content.formatData.format
    )
  ) {
    return false;
  }
  if (
    [ContentType.Flashcard, ContentType.Slide, ContentType.Text].includes(
      content.formatData.format
    ) ||
    questionnaireType === QuestionnaireType.Mixed
  ) {
    return true;
  }
  return (
    (!!content.hasCorrectAnswer &&
      questionnaireType === QuestionnaireType.Quiz) ||
    (!content.hasCorrectAnswer &&
      questionnaireType === QuestionnaireType.Survey)
  );
}

export function getAnswerOptions(
  options: string[],
  correctOptionIndexes?: number[]
): DisplayAnswer[] {
  return (options ?? []).map(
    (option, i) =>
      new DisplayAnswer(option, !!correctOptionIndexes?.includes(i))
  );
}
