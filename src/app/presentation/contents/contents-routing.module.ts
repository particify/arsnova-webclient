import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentsPageComponent } from '@app/presentation/contents/contents-page.component';

const routes: Routes = [
  {
    path: '',
    component: ContentsPageComponent,
  },
  {
    path: ':contentIndex',
    component: ContentsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentsRoutingModule {}
