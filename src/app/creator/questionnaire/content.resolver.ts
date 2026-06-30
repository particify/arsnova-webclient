import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { filter, map } from 'rxjs';
import { Content, QuestionnaireContentByIdGql } from '@gql/generated/graphql';

/**
 * A resolver that returns the current content (Content).
 */
export const contentResolver: ResolveFn<Content> = (
  route: ActivatedRouteSnapshot
) => {
  return inject(QuestionnaireContentByIdGql)
    .fetch({
      variables: {
        id: route.params.contentId,
      },
    })
    .pipe(
      map((r) => r.data?.questionnaireContentById),
      filter((n): n is Content => !!n)
    );
};
