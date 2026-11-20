import {
  getViolationReportReasonKey,
  getViolationReportTargetTypeKey,
} from '@app/core/utils/violation-report';
import {
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';

describe('getViolationReportReasonKey', () => {
  it('lowercases a single-word reason', () => {
    expect(getViolationReportReasonKey(ViolationReportReason.Copyright)).toBe(
      'copyright'
    );
  });

  it('joins the words of a multi-word reason with dashes', () => {
    expect(getViolationReportReasonKey(ViolationReportReason.HateSpeech)).toBe(
      'hate-speech'
    );
  });
});

describe('getViolationReportTargetTypeKey', () => {
  it('lowercases the target type', () => {
    expect(
      getViolationReportTargetTypeKey(ViolationReportTargetType.Room)
    ).toBe('room');
    expect(
      getViolationReportTargetTypeKey(ViolationReportTargetType.Template)
    ).toBe('template');
  });
});
