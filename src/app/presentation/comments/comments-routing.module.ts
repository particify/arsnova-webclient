import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentsPageComponent } from './comments-page.component';

const routes: Routes = [
  {
    path: '',
    component: CommentsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentsRoutingModule {}
