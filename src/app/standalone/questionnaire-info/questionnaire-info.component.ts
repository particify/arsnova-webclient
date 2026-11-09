import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { MatIconModule } from '@angular/material/icon';
import { provideTranslocoScope } from '@jsverse/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuestionnaireType } from '@gql/generated/graphql';
import { getQuestionnaireTypeIcons } from '@app/core/utils/questionnaire-format';

@Component({
  selector: 'app-questionnaire-info',
  imports: [
    TranslocoRootModule,
    CommonModule,
    FlexModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './questionnaire-info.component.html',
  styleUrl: './questionnaire-info.component.scss',
})
export class QuestionnaireInfoComponent {
  questionnaireType = input<QuestionnaireType>();
  contentCount = input<number>();
  published = input(true);
  countColor = input(false);

  QuestionnaireType = QuestionnaireType;
  typeIcons = getQuestionnaireTypeIcons();
}
