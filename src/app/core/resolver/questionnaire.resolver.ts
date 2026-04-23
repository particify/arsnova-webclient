import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import {
  Questionnaire,
  QuestionnaireByRoomIdAndNameGql,
} from '@gql/generated/graphql';
import { filter, map } from 'rxjs';

/**
 * A resolver that returns the current questionnaire (Questionnaire).
 */
export const questionnaireResolver: ResolveFn<Questionnaire> = (
  route: ActivatedRouteSnapshot
) => {
  return inject(QuestionnaireByRoomIdAndNameGql)
    .watch({
      variables: {
        roomId: route.data.roomId,
        name: route.params['seriesName'],
      },
    })
    .valueChanges.pipe(
      map((r) => r.data?.questionnaireByRoomIdAndName),
      filter((n): n is Questionnaire => !!n)
    );
};
