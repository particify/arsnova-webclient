import { QueryRef } from 'apollo-angular';
import { Subject } from 'rxjs';
import { refetchOn } from './refetch-on';

describe('refetchOn', () => {
  let valueChanges: Subject<string>;
  let trigger: Subject<void>;
  let queryRef: jasmine.SpyObj<QueryRef<string, { id: string }>>;

  beforeEach(() => {
    valueChanges = new Subject();
    trigger = new Subject();
    queryRef = jasmine.createSpyObj('QueryRef', ['refetch'], {
      valueChanges,
    });
  });

  function subscribe() {
    const results: unknown[] = [];
    const subscription = refetchOn(queryRef, trigger).subscribe((r) =>
      results.push(r)
    );
    return { results, subscription };
  }

  it('passes the query results through', () => {
    const { results } = subscribe();

    valueChanges.next('first');

    expect(results).toEqual(['first']);
  });

  it('refetches the query on each trigger', () => {
    queryRef.refetch.and.returnValue(Promise.resolve({}) as never);
    subscribe();

    trigger.next();
    trigger.next();

    expect(queryRef.refetch).toHaveBeenCalledTimes(2);
  });

  it('keeps refetching after a refetch has failed', async () => {
    queryRef.refetch.and.returnValue(Promise.reject(new Error()) as never);
    const { results } = subscribe();

    trigger.next();
    await Promise.resolve();
    trigger.next();
    valueChanges.next('after');

    expect(queryRef.refetch).toHaveBeenCalledTimes(2);
    expect(results).toEqual(['after']);
  });

  it('stops refetching once unsubscribed', () => {
    const { subscription } = subscribe();

    subscription.unsubscribe();
    trigger.next();

    expect(queryRef.refetch).not.toHaveBeenCalled();
  });
});
