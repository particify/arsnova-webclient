import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  Content,
  QuestionnaireContentByIdGql,
  QuestionnaireContentByQuestionnaireIdAndPositionGql,
} from '@gql/generated/graphql';

/**
 * A resolver that returns the current content (Content).
 */
export const contentResolver: ResolveFn<Content> = (
  route: ActivatedRouteSnapshot
) => {
  const contentId = route.params.contentId;
  if (contentId) {
    return inject(QuestionnaireContentByIdGql)
      .fetch({
        variables: {
          id: contentId,
        },
      })
      .pipe(
        map((r) => r.data?.questionnaireContentById),
        filter((n): n is Content => !!n)
      );
  }
  return inject(QuestionnaireContentByQuestionnaireIdAndPositionGql)
    .fetch({
      variables: {
        questionnaireId: route.data.questionnaire.id,
        position: route.params.contentIndex - 1,
      },
    })
    .pipe(
      map((r) => r.data?.questionnaireContentByQuestionnaireIdAndPosition),
      filter((n): n is Content => !!n)
    );
};
