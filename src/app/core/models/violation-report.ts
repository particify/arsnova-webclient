export enum ViolationReportReason {
  ADVERTISING = 'ADVERTISING',
  COPYRIGHT = 'COPYRIGHT',
  DISINFORMATION = 'DISINFORMATION',
  HATE_SPEECH = 'HATE_SPEECH',
  OTHER = 'OTHER',
}

export enum ViolationReportDecision {
  INVALID = 'INVALID',
  REMOVAL = 'REMOVAL',
}

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class ViolationReport {
  id!: string;
  targetType: string;
  targetId: string;
  reason: ViolationReportReason;
  description: string;
  decision?: ViolationReportDecision;

  constructor(
    targetType: string,
    targetId: string,
    reason: ViolationReportReason,
    description: string
  ) {
    this.targetType = targetType;
    this.targetId = targetId;
    this.reason = reason;
    this.description = description;
  }
}
