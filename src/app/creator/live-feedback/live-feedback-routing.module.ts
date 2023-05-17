import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveFeedbackPageComponent } from '@app/creator/live-feedback/live-feedback-page.component';

const routes: Routes = [
  {
    path: '',
    component: LiveFeedbackPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveFeedbackRoutingModule {}
