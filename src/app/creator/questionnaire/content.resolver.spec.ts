import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { QuestionnaireContentByIdGql } from '@gql/generated/graphql';
import { Observable, of, toArray, firstValueFrom } from 'rxjs';
import { contentResolver } from './content.resolver';

describe('contentResolver', () => {
  let contentById: jasmine.SpyObj<QuestionnaireContentByIdGql>;

  function resolve(contentId: string, result: unknown) {
    contentById = jasmine.createSpyObj('QuestionnaireContentByIdGql', [
      'fetch',
    ]);
    contentById.fetch.and.returnValue(of(result) as never);
    TestBed.configureTestingModule({
      providers: [
        { provide: QuestionnaireContentByIdGql, useValue: contentById },
      ],
    });
    const route = {
      params: { contentId },
    } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        (contentResolver(route, {} as never) as Observable<unknown>).pipe(
          toArray()
        )
      )
    );
  }

  it('resolves the content of the route', async () => {
    const content = { id: 'c-1' };

    const resolved = await resolve('c-1', {
      data: { questionnaireContentById: content },
    });

    expect(contentById.fetch).toHaveBeenCalledWith({
      variables: { id: 'c-1' },
    });
    expect(resolved).toEqual([content]);
  });

  it('resolves nothing for a content that does not exist', async () => {
    const resolved = await resolve('c-1', {
      data: { questionnaireContentById: null },
    });

    expect(resolved).toEqual([]);
  });
});
