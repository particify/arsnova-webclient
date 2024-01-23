// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Combination {
  count!: number;
  selectedChoiceIndexes!: number[];
}

export class RoundStatistics {
  round: number;
  independentCounts: number[];
  combinatedCounts: Combination[];
  abstentionCount: number;
  answerCount: number;

  constructor(
    round: number,
    independentCounts: number[],
    combinatedCounts: Combination[],
    abstentionCount: number,
    answerCount: number
  ) {
    this.round = round;
    this.independentCounts = independentCounts;
    this.combinatedCounts = combinatedCounts;
    this.abstentionCount = abstentionCount;
    this.answerCount = answerCount;
  }
}

export class TextRoundStatistics extends RoundStatistics {
  texts: string[];

  constructor(
    round: number,
    independentCounts: number[],
    combinatedCounts: Combination[],
    abstentionCount: number,
    answerCount: number,
    texts: string[]
  ) {
    super(
      round,
      independentCounts,
      combinatedCounts,
      abstentionCount,
      answerCount
    );
    this.texts = texts;
  }
}

export class PrioritizationRoundStatistics extends RoundStatistics {
  assignedPoints: number[];

  constructor(
    round: number,
    independentCounts: number[],
    combinatedCounts: Combination[],
    abstentionCount: number,
    answerCount: number,
    assignedPoints: number[]
  ) {
    super(
      round,
      independentCounts,
      combinatedCounts,
      abstentionCount,
      answerCount
    );
    this.assignedPoints = assignedPoints;
  }
}

export class NumericRoundStatistics extends RoundStatistics {
  selectedNumbers: number[];
  minimum: number;
  maximum: number;
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  correctAnswerFraction: number;

  constructor(
    round: number,
    independentCounts: number[],
    combinatedCounts: Combination[],
    abstentionCount: number,
    answerCount: number,
    selectedNumbers: number[],
    minimum: number,
    maximum: number,
    mean: number,
    median: number,
    standardDeviation: number,
    variance: number,
    correctAnswerFraction: number
  ) {
    super(
      round,
      independentCounts,
      combinatedCounts,
      abstentionCount,
      answerCount
    );
    this.selectedNumbers = selectedNumbers;
    this.minimum = minimum;
    this.maximum = maximum;
    this.mean = mean;
    this.median = median;
    this.standardDeviation = standardDeviation;
    this.variance = variance;
    this.correctAnswerFraction = correctAnswerFraction;
  }
}
