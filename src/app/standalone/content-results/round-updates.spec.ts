import { Round } from '@gql/generated/graphql';
import { BehaviorSubject, Subject } from 'rxjs';
import { updatesOnceOpen } from './round-updates';

function round(id: string, closed: boolean): Round {
  return { id, closed } as Round;
}

describe('updatesOnceOpen', () => {
  let rounds$: BehaviorSubject<Round[]>;
  let updates$: Subject<string>;
  let subscribed: number;
  let received: string[];

  function listen(roundId = 'round-1') {
    updatesOnceOpen(rounds$, roundId, () => {
      subscribed++;
      return updates$;
    }).subscribe((update) => received.push(update));
  }

  beforeEach(() => {
    updates$ = new Subject();
    subscribed = 0;
    received = [];
  });

  it('listens to an open round right away', () => {
    rounds$ = new BehaviorSubject([round('round-1', false)]);
    listen();

    updates$.next('update');

    expect(subscribed).toBe(1);
    expect(received).toEqual(['update']);
  });

  it('does not listen to a closed round', () => {
    rounds$ = new BehaviorSubject([round('round-1', true)]);
    listen();

    expect(subscribed).toBe(0);
  });

  it('starts listening once a closed round is reopened', () => {
    rounds$ = new BehaviorSubject([round('round-1', true)]);
    listen();

    rounds$.next([round('round-1', false)]);
    updates$.next('update');

    expect(subscribed).toBe(1);
    expect(received).toEqual(['update']);
  });

  it('keeps listening to a round closed while it is shown', () => {
    rounds$ = new BehaviorSubject([round('round-1', false)]);
    listen();

    rounds$.next([round('round-1', true)]);
    updates$.next('late answer');

    expect(subscribed).toBe(1);
    expect(received).toEqual(['late answer']);
  });

  it('subscribes once however often the rounds re-emit', () => {
    rounds$ = new BehaviorSubject([round('round-1', false)]);
    listen();

    rounds$.next([round('round-1', true)]);
    rounds$.next([round('round-1', false)]);

    expect(subscribed).toBe(1);
  });

  it('listens to a round the rounds do not list yet', () => {
    rounds$ = new BehaviorSubject([round('round-2', true)]);
    listen();

    expect(subscribed).toBe(1);
  });
});
