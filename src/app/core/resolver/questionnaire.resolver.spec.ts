import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  UrlSegment,
  convertToParamMap,
} from '@angular/router';
import { QuestionnaireByIdGql } from '@gql/generated/graphql';
import { Observable, firstValueFrom, of, tap, throwError } from 'rxjs';
import { questionnaireResolver } from './questionnaire.resolver';

function snapshot(
  path: string[],
  params: Record<string, string>
): ActivatedRouteSnapshot {
  return {
    url: path.map((p) => new UrlSegment(p, {})),
    params,
    paramMap: convertToParamMap(params),
  } as unknown as ActivatedRouteSnapshot;
}

describe('questionnaireResolver', () => {
  const root = snapshot([], {});
  const role = snapshot(['p'], {});
  const room = snapshot(['12345678'], { shortId: '12345678' });
  const questionnaire = snapshot(['questionnaire', 'q-1'], {
    questionnaireId: 'q-1',
  });
  for (const [i, s] of [root, role, room, questionnaire].entries()) {
    Object.assign(s, {
      pathFromRoot: [root, role, room, questionnaire].slice(0, i + 1),
    });
  }

  let questionnaireById: jasmine.SpyObj<QuestionnaireByIdGql>;

  function provide(
    fetch: (options: { fetchPolicy?: string }) => Observable<unknown>
  ) {
    questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', ['fetch']);
    questionnaireById.fetch.and.callFake(fetch as never);
    TestBed.configureTestingModule({
      providers: [
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
      ],
    });
  }

  function navigate() {
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        questionnaireResolver(questionnaire, {} as never) as Observable<unknown>
      )
    );
  }

  function resolve(fetch: Observable<unknown>) {
    provide(() => fetch);
    return navigate();
  }

  /**
   * Answers like Apollo's cache: once the server has returned data, a
   * cache-first fetch gets that data back without asking the server again.
   */
  function cachingServer(...responses: Observable<unknown>[]) {
    let cached: unknown;
    let calls = 0;
    const server = jasmine
      .createSpy('server')
      .and.callFake(() => responses[calls++].pipe(tap((r) => (cached = r))));
    const fetch = (options: { fetchPolicy?: string }) =>
      cached && (options.fetchPolicy ?? 'cache-first') === 'cache-first'
        ? of(cached)
        : (server() as Observable<unknown>);
    return { fetch, server };
  }

  function redirectUrl(result: unknown): string {
    expect(result).toBeInstanceOf(RedirectCommand);
    return TestBed.inject(Router).serializeUrl(
      (result as RedirectCommand).redirectTo as never
    );
  }

  it('resolves a readable questionnaire', async () => {
    const q = { id: 'q-1' };
    expect(await resolve(of({ data: { questionnaireById: q } }))).toBe(q);
  });

  it('leads back to the room when reading is forbidden', async () => {
    const result = await resolve(throwError(() => new Error('Forbidden')));
    expect(redirectUrl(result)).toBe('/p/12345678');
  });

  it('leads back to the room when the questionnaire does not exist', async () => {
    const result = await resolve(of({ data: { questionnaireById: null } }));
    expect(redirectUrl(result)).toBe('/p/12345678');
  });

  it('always asks the server rather than the cache', async () => {
    await resolve(of({ data: { questionnaireById: { id: 'q-1' } } }));
    expect(questionnaireById.fetch).toHaveBeenCalledWith({
      variables: { id: 'q-1' },
      fetchPolicy: 'network-only',
    });
  });

  it('leads back to the room when the server denies a questionnaire it allowed before', async () => {
    const q = { id: 'q-1' };
    const { fetch, server } = cachingServer(
      of({ data: { questionnaireById: q } }),
      throwError(() => new Error('Forbidden'))
    );
    provide(fetch);

    expect(await navigate()).toBe(q);
    const result = await navigate();

    expect(server).toHaveBeenCalledTimes(2);
    expect(redirectUrl(result)).toBe('/p/12345678');
  });
});
