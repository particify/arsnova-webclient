import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  UrlSegment,
  convertToParamMap,
} from '@angular/router';
import { QuestionnaireContentByIdGql } from '@gql/generated/graphql';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { contentResolver } from './content.resolver';

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

describe('contentResolver', () => {
  const root = snapshot([], {});
  const role = snapshot(['edit'], {});
  const room = snapshot(['12345678'], { shortId: '12345678' });
  const questionnaire = snapshot(['questionnaire', 'q-1'], {
    questionnaireId: 'q-1',
  });
  const content = snapshot(['edit', 'c-1'], { contentId: 'c-1' });
  const routes = [root, role, room, questionnaire, content];
  for (const [i, s] of routes.entries()) {
    Object.assign(s, { pathFromRoot: routes.slice(0, i + 1) });
  }

  let contentById: jasmine.SpyObj<QuestionnaireContentByIdGql>;

  function resolve(fetch: Observable<unknown>) {
    contentById = jasmine.createSpyObj('QuestionnaireContentByIdGql', [
      'fetch',
    ]);
    contentById.fetch.and.returnValue(fetch as never);
    TestBed.configureTestingModule({
      providers: [
        { provide: QuestionnaireContentByIdGql, useValue: contentById },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        contentResolver(content, {} as never) as Observable<unknown>
      )
    );
  }

  function redirectUrl(result: unknown): string {
    expect(result).toBeInstanceOf(RedirectCommand);
    return TestBed.inject(Router).serializeUrl(
      (result as RedirectCommand).redirectTo as never
    );
  }

  it('resolves the content of the route', async () => {
    const c = { id: 'c-1' };

    const resolved = await resolve(
      of({ data: { questionnaireContentById: c } })
    );

    expect(contentById.fetch).toHaveBeenCalledWith({
      variables: { id: 'c-1' },
    });
    expect(resolved).toBe(c);
  });

  it('leads back to the room when the content does not exist', async () => {
    const result = await resolve(
      of({ data: { questionnaireContentById: null } })
    );
    expect(redirectUrl(result)).toBe('/edit/12345678');
  });

  it('leads back to the room when reading is forbidden', async () => {
    const result = await resolve(throwError(() => new Error('Forbidden')));
    expect(redirectUrl(result)).toBe('/edit/12345678');
  });
});
