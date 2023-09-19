import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { ParentRoute } from '@app/core/models/parent-route';

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
    component: ContentCreationPageComponent,
    title: 'content-creation',
  },
  {
    path: 'edit/:contentId',
    component: ContentCreationPageComponent,
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
