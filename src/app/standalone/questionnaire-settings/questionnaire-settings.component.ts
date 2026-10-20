import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideTranslocoScope } from '@jsverse/transloco';
import {
  Questionnaire,
  QuestionnairePublishingMode,
  QuestionnaireType,
  UpdateQuestionnaireGql,
} from '@gql/generated/graphql';
import {
  ErrorClassification,
  FALLBACK_HANDLER,
  handleOperationErrors,
} from '@gql/helper/handle-operation-error';
import { NotificationService } from '@app/core/services/util/notification.service';

@Component({
  selector: 'app-questionnaire-settings',
  imports: [
    CoreModule,
    SettingsSlideToggleComponent,
    LoadingButtonComponent,
    MatButtonToggleModule,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './questionnaire-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './questionnaire-settings.component.scss',
})
export class QuestionnaireSettingsComponent
  extends FormComponent
  implements OnInit
{
  private dialogRef =
    inject<MatDialogRef<QuestionnaireSettingsComponent>>(MatDialogRef);
  data = inject<{
    questionnaire: Questionnaire;
    alreadyAnswered: boolean;
  }>(MAT_DIALOG_DATA);
  private readonly updateQuestionnaire = inject(UpdateQuestionnaireGql);
  private readonly notificationService = inject(NotificationService);

  nameFormControl = new UntypedFormControl();
  questionnaire: Questionnaire;
  QuestionnaireType = QuestionnaireType;
  PublishingMode = QuestionnairePublishingMode;

  private previousPublishingMode = QuestionnairePublishingMode.All;

  constructor() {
    super();
    const data = this.data;

    this.questionnaire = data.questionnaire;
  }
  ngOnInit(): void {
    this.setFormControl(this.nameFormControl);
    this.nameFormControl.setValue(this.data.questionnaire.name);
    this.nameFormControl.clearValidators();
    this.nameFormControl.setValidators([
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.nameFormControl.updateValueAndValidity();
  }

  saveGroup() {
    if (this.nameFormControl.valid) {
      this.disableForm();
      this.updateQuestionnaire
        .mutate({
          variables: {
            id: this.questionnaire.id,
            name: this.nameFormControl.value,
            published: this.questionnaire.published ?? false,
            publishingMode: this.questionnaire.publishingMode,
            statisticsPublished: this.questionnaire.statisticsPublished,
            correctOptionsPublished:
              this.questionnaire.correctOptionsPublished ?? false,
            leaderboardEnabled: this.questionnaire.leaderboardEnabled ?? false,
          },
        })
        .subscribe({
          next: (result) => {
            const questionnaire = result.data?.updateQuestionnaire;
            if (questionnaire) {
              this.dialogRef.close(questionnaire);
            } else {
              this.enableForm();
            }
          },
          error: (e) => {
            this.enableForm();
            handleOperationErrors(e, {
              [ErrorClassification.BadRequest]: () =>
                this.nameFormControl.setErrors({ validateUniqueName: true }),
              [FALLBACK_HANDLER]: () =>
                this.notificationService.showOnRequestClientError(e),
            });
          },
        });
    }
  }

  isLive(): boolean {
    return (
      this.data.questionnaire.publishingMode ===
      QuestionnairePublishingMode.Live
    );
  }

  setLiveMode(live: boolean): void {
    if (live) {
      this.previousPublishingMode = this.questionnaire.publishingMode;
      this.questionnaire.publishingMode = QuestionnairePublishingMode.Live;
    } else {
      this.questionnaire.publishingMode = this.previousPublishingMode;
    }
  }
}
