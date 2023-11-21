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

export class ViolationReport {
  id: string;
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
