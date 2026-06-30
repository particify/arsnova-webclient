import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-content-group-settings',
  imports: [
    CoreModule,
    SettingsSlideToggleComponent,
    LoadingButtonComponent,
    MatButtonToggleModule,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-group-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-group-settings.component.scss',
})
export class ContentGroupSettingsComponent
  extends FormComponent
  implements OnInit
{
  private dialogRef =
    inject<MatDialogRef<ContentGroupSettingsComponent>>(MatDialogRef);
  data = inject<{
    questionnaire: Questionnaire;
    groupNames: string[];
    alreadyAnswered: boolean;
  }>(MAT_DIALOG_DATA);
  private readonly updateQuestionnaire = inject(UpdateQuestionnaireGql);

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
      this.validateUniqueName(),
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
          error: () => this.enableForm(),
        });
    }
  }

  validateUniqueName(): ValidatorFn {
    return (formControl) =>
      formControl.value !== this.questionnaire.name &&
      this.data.groupNames.includes(formControl.value)
        ? { validateUniqueName: { value: formControl.value } }
        : null;
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
