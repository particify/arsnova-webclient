import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentEditingPageComponent } from './content-editing/content-editing-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { ParentRoute } from '@app/core/models/parent-route';
import { LeaderboardPageComponent } from '@app/creator/content-group/leaderboard-page/leaderboard-page.component';

const routes: Routes = [
  {
    path: '',
    component: ContentGroupPageComponent,
    data: {
      parentRoute: ParentRoute.ROOM,
    },
  },
  {
    path: 'create',
    component: ContentEditingPageComponent,
    title: 'content-creation',
  },
  {
    path: 'edit/:contentId',
    component: ContentEditingPageComponent,
    data: {
      isEditMode: true,
    },
    title: 'content-edit',
  },
  {
    path: 'statistics',
    component: StatisticsPageComponent,
    title: 'series',
  },
  {
    path: 'leaderboard',
    component: LeaderboardPageComponent,
    title: 'series',
  },
  {
    path: ':contentIndex',
    component: ContentPresentationComponent,
    title: 'series',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentGroupRoutingModule {}
