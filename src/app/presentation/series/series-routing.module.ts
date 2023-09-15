import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeriesPageComponent } from '@app/presentation/series/series-page.component';

const routes: Routes = [
  {
    path: '',
    component: SeriesPageComponent,
  },
  {
    path: ':contentIndex',
    component: SeriesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeriesRoutingModule {}
