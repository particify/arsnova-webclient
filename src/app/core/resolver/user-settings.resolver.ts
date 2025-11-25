import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import {
  CurrentUserWithSettingsGql,
  UserUiSettings,
} from '@gql/generated/graphql';

export const userSettingsResolver: ResolveFn<UserUiSettings> = () => {
  return inject(CurrentUserWithSettingsGql)
    .fetch()
    .pipe(
      map(
        (r) =>
          r.data?.currentUser?.uiSettings ?? {
            contentVisualizationUnitPercent: true,
            contentAnswersDirectlyBelowChart: false,
            showContentResultsDirectly: false,
            rotateWordcloudItems: true,
          }
      )
    );
};
