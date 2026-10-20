import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentEditingComponent } from './content-editing/content-editing.component';
import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { userSettingsResolver } from '@app/core/resolver/user-settings.resolver';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { questionnaireResolver } from '@app/core/resolver/questionnaire.resolver';
import { QuestionnairePageComponent } from './questionnaire-page.component';
import { contentResolver } from './content.resolver';

const routes: Routes = [
  // Desktop

  {
    path: 'create',
    component: ContentEditingComponent,
    data: {
      fixedHeight: true,
    },
  },
  {
    path: 'edit/:contentId',
    component: ContentEditingComponent,
    data: {
      fixedHeight: true,
      isEditMode: true,
    },
    resolve: {
      content: contentResolver,
    },
  },

  {
    path: 'leaderboard',
    component: ContentGroupLeaderboardComponent,
    data: {
      showAll: true,
    },
  },
  {
    path: 'attributions',
    component: AttributionsInfoComponent,
  },
  {
    path: ':contentId',
    component: ContentResultsComponent,
    runGuardsAndResolvers: 'always',
    data: {
      allowAnswerModeration: true,
      directShow: true,
      active: true,
      showCorrect: true,
      isStandalone: true,
    },
    resolve: {
      content: contentResolver,
      settings: userSettingsResolver,
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ':questionnaireId',
        component: QuestionnairePageComponent,
        resolve: {
          questionnaire: questionnaireResolver,
        },
        runGuardsAndResolvers: 'always',
        children: [...routes],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class QuestionnaireRoutingModule {}
