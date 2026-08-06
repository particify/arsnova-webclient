import { Round } from '@gql/generated/graphql';
import { answeringEndDate, isRoundOver, roundKey } from './answering';

const NOW = Date.parse('2026-08-06T12:00:00Z');

function round(overrides: Partial<Round> = {}): Round {
  return {
    __typename: 'Round',
    id: 'round-1',
    contentId: 'content-1',
    roundNo: 1,
    closed: false,
    started: true,
    answerable: true,
    ...overrides,
  };
}

function isoAt(offsetMs: number) {
  return new Date(NOW + offsetMs).toISOString();
}

describe('answeringEndDate', () => {
  it('returns undefined without a round', () => {
    expect(answeringEndDate(undefined)).toBeUndefined();
    expect(answeringEndDate(null)).toBeUndefined();
  });

  it('returns undefined for a round without a time limit', () => {
    expect(answeringEndDate(round())).toBeUndefined();
    expect(answeringEndDate(round({ answeringEndTime: null }))).toBeUndefined();
  });

  it('parses the deadline into a Date', () => {
    const endDate = answeringEndDate(round({ answeringEndTime: isoAt(30000) }));
    expect(endDate?.getTime()).toBe(NOW + 30000);
  });
});

describe('roundKey', () => {
  it('returns undefined without a round', () => {
    expect(roundKey(undefined)).toBeUndefined();
    expect(roundKey(null)).toBeUndefined();
  });

  it('changes when the deadline is re-stamped on the same round', () => {
    const before = roundKey(round({ answeringEndTime: isoAt(10000) }));
    const after = roundKey(round({ answeringEndTime: isoAt(40000) }));
    expect(after).not.toBe(before);
  });

  it('changes when the round is closed', () => {
    expect(roundKey(round({ closed: true }))).not.toBe(roundKey(round()));
  });

  it('changes for a new round', () => {
    expect(roundKey(round({ id: 'round-2', roundNo: 2 }))).not.toBe(
      roundKey(round())
    );
  });

  it('stays stable when nothing relevant changes', () => {
    expect(roundKey(round({ answeringEndTime: isoAt(10000) }))).toBe(
      roundKey(round({ answeringEndTime: isoAt(10000) }))
    );
  });

  it('changes when a reopen clears a previously set deadline', () => {
    const withDeadline = round({ answeringEndTime: isoAt(30000) });
    const reopenedWithoutDeadline = round({
      closed: false,
      answeringEndTime: null,
    });
    expect(roundKey(reopenedWithoutDeadline)).not.toBe(roundKey(withDeadline));
  });

  it('changes when a reopen sets a new deadline where there was none', () => {
    const withoutDeadline = round({ answeringEndTime: null });
    const reopenedWithDeadline = round({
      closed: false,
      answeringEndTime: isoAt(15000),
    });
    expect(roundKey(reopenedWithDeadline)).not.toBe(roundKey(withoutDeadline));
  });
});

describe('isRoundOver', () => {
  it('never locks outside live mode', () => {
    expect(isRoundOver(round({ answerable: false }), NOW, false)).toBe(false);
    expect(
      isRoundOver(round({ answeringEndTime: isoAt(-1000) }), NOW, false)
    ).toBe(false);
  });

  it('does not lock without a round', () => {
    expect(isRoundOver(undefined, NOW, true)).toBe(false);
    expect(isRoundOver(null, NOW, true)).toBe(false);
  });

  it('does not lock a running round without a time limit', () => {
    expect(isRoundOver(round(), NOW, true)).toBe(false);
  });

  it('does not lock while the deadline is in the future', () => {
    expect(
      isRoundOver(round({ answeringEndTime: isoAt(1000) }), NOW, true)
    ).toBe(false);
  });

  it('locks once the deadline has passed', () => {
    expect(
      isRoundOver(round({ answeringEndTime: isoAt(-1000) }), NOW, true)
    ).toBe(true);
  });

  it('locks exactly at the deadline', () => {
    expect(isRoundOver(round({ answeringEndTime: isoAt(0) }), NOW, true)).toBe(
      true
    );
  });

  it('locks a closed round regardless of its deadline', () => {
    expect(
      isRoundOver(
        round({
          closed: true,
          answerable: false,
          answeringEndTime: isoAt(30000),
        }),
        NOW,
        true
      )
    ).toBe(true);
  });

  it('locks a round the backend already flagged as not answerable, even before its own endDate check would', () => {
    expect(
      isRoundOver(
        round({ answerable: false, answeringEndTime: isoAt(30000) }),
        NOW,
        true
      )
    ).toBe(true);
  });

  it('unlocks again once a restart resumes with a shorter remaining deadline', () => {
    const stopped = round({
      closed: true,
      answerable: false,
      answeringEndTime: isoAt(-1000),
    });
    expect(isRoundOver(stopped, NOW, true)).toBe(true);

    const restarted = round({
      closed: false,
      answerable: true,
      answeringEndTime: isoAt(5000),
    });
    expect(isRoundOver(restarted, NOW, true)).toBe(false);
  });

  it('does not lock a round reopened with no deadline at all', () => {
    const stoppedAfterExpiry = round({
      closed: true,
      answerable: false,
      answeringEndTime: isoAt(-1000),
    });
    expect(isRoundOver(stoppedAfterExpiry, NOW, true)).toBe(true);

    const reopenedWithoutDeadline = round({
      closed: false,
      answerable: true,
      answeringEndTime: null,
    });
    expect(isRoundOver(reopenedWithoutDeadline, NOW, true)).toBe(false);
  });

  it('does not lock a fresh round of a content whose previous round expired', () => {
    const newRound = round({
      id: 'round-2',
      roundNo: 2,
      answeringEndTime: isoAt(30000),
    });
    expect(isRoundOver(newRound, NOW, true)).toBe(false);
  });

  it('locks a round whose deadline expired without being explicitly stopped', () => {
    const expiredButOpen = round({
      closed: false,
      answerable: false,
      answeringEndTime: isoAt(-1000),
    });
    expect(isRoundOver(expiredButOpen, NOW, true)).toBe(true);
  });
});
