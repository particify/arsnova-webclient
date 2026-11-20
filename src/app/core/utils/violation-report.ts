import {
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';

/** Suffix of the `violation-report.reason-*` translation keys. */
export function getViolationReportReasonKey(
  reason: ViolationReportReason
): string {
  return reason.toLowerCase().replaceAll('_', '-');
}

/** Suffix of the per-target-type translation keys, e.g. `violation-report.report-*`. */
export function getViolationReportTargetTypeKey(
  targetType: ViolationReportTargetType
): string {
  return targetType.toLowerCase();
}
