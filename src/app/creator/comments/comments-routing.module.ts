import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentsPageComponent } from '@app/creator/comments/comments-page.component';

const routes: Routes = [
  {
    path: '',
    component: CommentsPageComponent,
  },
  {
    path: 'moderation',
    component: CommentsPageComponent,
    data: {
      isModeration: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentsRoutingModule {}
