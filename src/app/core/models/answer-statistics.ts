import { RoundStatistics } from './round-statistics';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class AnswerStatistics {
  contentId!: string;
  roundStatistics!: RoundStatistics[];
}
