import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  UrlSegment,
  convertToParamMap,
} from '@angular/router';
import { QuestionnaireByIdGql } from '@gql/generated/graphql';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
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

  function resolve(fetch: Observable<unknown>) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QuestionnaireByIdGql,
          useValue: { fetch: () => fetch },
        },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        questionnaireResolver(questionnaire, {} as never) as Observable<unknown>
      )
    );
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
});
