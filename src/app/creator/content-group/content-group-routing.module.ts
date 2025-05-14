import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentGroupResolver } from '@app/core/resolver/content-group.resolver';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentResolver } from '@app/core/resolver/content.resolver';
import { ContentEditingComponent } from './content-editing/content-editing.component';
import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { UserSettingsResolver } from '@app/core/resolver/user-settings.resolver';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';

const routes: Routes = [
  // Desktop

  {
    path: 'create',
    component: ContentEditingComponent,
    data: {
      fixedHeight: true,
    },
  },
  {
    path: 'edit/:contentId',
    component: ContentEditingComponent,
    data: {
      fixedHeight: true,
      isEditMode: true,
    },
    resolve: {
      content: ContentResolver,
    },
  },

  {
    path: 'leaderboard',
    component: ContentGroupLeaderboardComponent,
    data: {
      showAll: true,
    },
  },
  {
    path: 'attributions',
    component: AttributionsInfoComponent,
  },
  {
    path: ':contentIndex',
    component: ContentResultsComponent,
    runGuardsAndResolvers: 'always',
    data: {
      directShow: true,
      active: true,
      showCorrect: true,
      isStandalone: true,
    },
    resolve: {
      content: ContentResolver,
      settings: UserSettingsResolver,
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ':seriesName',
        component: ContentGroupPageComponent,
        data: { extendedView: true },
        resolve: {
          contentGroup: ContentGroupResolver,
        },
        runGuardsAndResolvers: 'always',
        children: [...routes],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ContentGroupRoutingModule {}
