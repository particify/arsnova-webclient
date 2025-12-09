import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { RoomLanguageByShortIdGql } from '@gql/generated/graphql';
import { map, of } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

/**
 * A resolver that returns the current room language
 * if avaiable or user language as fallback.
 */
export const languageResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot
) => {
  const translateService = inject(TranslocoService);
  const shortId = route.params['shortId'];
  if (shortId) {
    return inject(RoomLanguageByShortIdGql)
      .fetch({ variables: { shortId: shortId } })
      .pipe(
        map(
          (r) =>
            r.data?.roomByShortId?.language ?? translateService.getActiveLang()
        )
      );
  }
  return of(translateService.getActiveLang());
};
