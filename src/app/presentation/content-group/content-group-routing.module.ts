import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentGroupPageComponent } from '@app/presentation/content-group/content-group-page.component';

const routes: Routes = [
  {
    path: '',
    component: ContentGroupPageComponent,
  },
  {
    path: ':contentIndex',
    component: ContentGroupPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentGroupRoutingModule {}
