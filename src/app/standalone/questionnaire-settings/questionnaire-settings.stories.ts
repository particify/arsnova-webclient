import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnaireSettingsComponent } from '@app/standalone/questionnaire-settings/questionnaire-settings.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  QuestionnaireType,
  UpdateQuestionnaireGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';

class MockDialogRef {
  close() {}
}

const updateQuestionnaireGqlMock = {
  mutate: () =>
    of({
      data: {
        updateQuestionnaire: {
          id: 'questionnaireId',
          name: 'Quiz',
          contentCount: 42,
          published: true,
          type: QuestionnaireType.Quiz,
        },
      },
    }),
};

export default {
  component: QuestionnaireSettingsComponent,
  title: 'QuestionnaireSettings',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        QuestionnaireSettingsComponent,
        SettingsSlideToggleComponent,
        LoadingIndicatorComponent,
        LoadingButtonComponent,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            questionnaire: {
              id: 'questionnaireId',
              name: 'Quiz',
              contentCount: 42,
              published: true,
              type: QuestionnaireType.Quiz,
            },
            alreadyAnswered: false,
          },
        },
        {
          provide: UpdateQuestionnaireGql,
          useValue: updateQuestionnaireGqlMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<QuestionnaireSettingsComponent>;

export const ContentGroupSettings: Story = {};
