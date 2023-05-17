import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentsPageComponent } from './comments-page.component';
import { Features } from '@app/core/models/features.enum';

const routes: Routes = [
  {
    path: '',
    component: CommentsPageComponent,
    data: {
      feature: Features.COMMENTS,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentsRoutingModule {}
