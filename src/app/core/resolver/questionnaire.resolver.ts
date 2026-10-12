import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
} from '@angular/router';
import { Questionnaire, QuestionnaireByIdGql } from '@gql/generated/graphql';
import { catchError, map, of } from 'rxjs';

/**
 * A resolver that returns the current questionnaire (Questionnaire).
 *
 * A questionnaire the user may not read, such as an unpublished one for a
 * participant, or one that no longer exists leads back to the room instead of
 * failing the navigation.
 */
export const questionnaireResolver: ResolveFn<Questionnaire> = (
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
    })
    .pipe(
      map(
        (r) =>
          (r.data?.questionnaireById as Questionnaire | undefined) ?? toRoom()
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
