import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentsPageComponent } from './comments-page.component';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';

const routes: Routes = [
  {
    path: '',
    component: CommentsPageComponent,
    data: {
      feature: RoutingFeature.COMMENTS,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentsRoutingModule {}
