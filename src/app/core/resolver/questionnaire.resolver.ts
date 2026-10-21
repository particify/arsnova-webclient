import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
} from '@angular/router';
import {
  QuestionnaireByIdGql,
  QuestionnaireDetailsFragment,
} from '@gql/generated/graphql';
import { catchError, map, of } from 'rxjs';

/**
 * A resolver that returns the current questionnaire.
 *
 * A questionnaire the user may not read, such as an unpublished one for a
 * participant, or one that no longer exists leads back to the room instead of
 * failing the navigation. It always asks the server, as release and
 * permissions may have changed since the questionnaire was last cached.
 */
export const questionnaireResolver: ResolveFn<QuestionnaireDetailsFragment> = (
  route: ActivatedRouteSnapshot
) => {
  const router = inject(Router);
  const toRoom = () =>
    new RedirectCommand(router.createUrlTree(roomPath(route)));
  return inject(QuestionnaireByIdGql)
    .fetch({
      variables: {
        id: route.params['questionnaireId'],
      },
      fetchPolicy: 'network-only',
    })
    .pipe(
      map(
        (r) =>
          (r.data?.questionnaireById as
            QuestionnaireDetailsFragment | undefined) ?? toRoom()
      ),
      catchError(() => of(toRoom()))
    );
};

/** The URL of the room route the given route is nested in. */
export function roomPath(route: ActivatedRouteSnapshot): string[] {
  const roomRoute = route.pathFromRoot.find((r) => r.paramMap.has('shortId'));
  const segments = (roomRoute?.pathFromRoot ?? []).flatMap((r) =>
    r.url.map((s) => s.path)
  );
  return ['/', ...segments];
}
