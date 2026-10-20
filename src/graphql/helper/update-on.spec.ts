import { QueryRef } from 'apollo-angular';
import { Subject } from 'rxjs';
import { updateOn } from './update-on';

type Data = { stats: { count: number } | null };
type Update = { data?: { statsUpdated: { count: number } | null } };

describe('updateOn', () => {
  let valueChanges: Subject<string>;
  let updates: Subject<Update>;
  let queryRef: jasmine.SpyObj<QueryRef<Data, { id: string }>>;

  beforeEach(() => {
    valueChanges = new Subject();
    updates = new Subject();
    queryRef = jasmine.createSpyObj('QueryRef', ['updateQuery'], {
      valueChanges,
    });
  });

  function subscribe() {
    const results: unknown[] = [];
    const subscription = updateOn(queryRef, updates, (u) =>
      u.data ? { stats: u.data.statsUpdated } : undefined
    ).subscribe({
      next: (r) => results.push(r),
      error: () => results.push('error'),
    });
    return { results, subscription };
  }

  function writtenData(): Data {
    const mapFn = queryRef.updateQuery.calls.mostRecent().args[0];
    return mapFn({} as never, {} as never) as Data;
  }

  it('passes the query results through', () => {
    const { results } = subscribe();

    valueChanges.next('first');

    expect(results).toEqual(['first']);
  });

  it('writes each push into the query', () => {
    subscribe();

    updates.next({ data: { statsUpdated: { count: 1 } } });
    updates.next({ data: { statsUpdated: { count: 2 } } });

    expect(queryRef.updateQuery).toHaveBeenCalledTimes(2);
    expect(writtenData()).toEqual({ stats: { count: 2 } });
  });

  it('ignores a push that carries no data', () => {
    subscribe();

    updates.next({});

    expect(queryRef.updateQuery).not.toHaveBeenCalled();
  });

  it('keeps the query alive when the pushes fail', () => {
    spyOn(console, 'error');
    const { results } = subscribe();

    updates.error(new Error('Subscription lost'));
    valueChanges.next('later');

    expect(console.error).toHaveBeenCalled();
    expect(results).toEqual(['later']);
  });

  it('stops listening to the pushes when unsubscribed', () => {
    const { subscription } = subscribe();
    expect(updates.observed).toBeTrue();

    subscription.unsubscribe();

    expect(updates.observed).toBeFalse();
  });
});
