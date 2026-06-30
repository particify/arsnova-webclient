import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Questionnaire, QuestionnaireByIdGql } from '@gql/generated/graphql';
import { filter, map } from 'rxjs';

/**
 * A resolver that returns the current questionnaire (Questionnaire).
 */
export const questionnaireResolver: ResolveFn<Questionnaire> = (
  route: ActivatedRouteSnapshot
) => {
  return inject(QuestionnaireByIdGql)
    .watch({
      variables: {
        id: route.params['questionnaireId'],
      },
    })
    .valueChanges.pipe(
      map((r) => r.data?.questionnaireById),
      filter((n): n is Questionnaire => !!n)
    );
};
