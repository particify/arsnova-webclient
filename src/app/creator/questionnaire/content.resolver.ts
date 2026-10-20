import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
} from '@angular/router';
import { roomPath } from '@app/core/resolver/questionnaire.resolver';
import { Content, QuestionnaireContentByIdGql } from '@gql/generated/graphql';
import { catchError, map, of } from 'rxjs';

/**
 * A resolver that returns the current content (Content).
 *
 * A content that cannot be read or no longer exists leads back to the room
 * instead of failing the navigation. It always asks the server, as release
 * and permissions may have changed since the content was last cached.
 */
export const contentResolver: ResolveFn<Content> = (
  route: ActivatedRouteSnapshot
) => {
  const router = inject(Router);
  const toRoom = () =>
    new RedirectCommand(router.createUrlTree(roomPath(route)));
  return inject(QuestionnaireContentByIdGql)
    .fetch({
      variables: {
        id: route.params.contentId,
      },
      fetchPolicy: 'network-only',
    })
    .pipe(
      map(
        (r) =>
          (r.data?.questionnaireContentById as Content | undefined) ?? toRoom()
      ),
      catchError(() => of(toRoom()))
    );
};
