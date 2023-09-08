import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeriesPageComponent } from './series-page.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';

const routes: Routes = [
  {
    path: '',
    component: SeriesPageComponent,
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
export class SeriesRoutingModule {}
