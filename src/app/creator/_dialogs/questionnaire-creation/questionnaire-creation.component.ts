import { Component, ElementRef, inject, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { take } from 'rxjs';
import { mutationHelper } from '@gql/helper/mutation-helper';
import {
  DetailedRadioGroup,
  DetailRadioGroupComponent,
} from '@app/standalone/detail-radio-group/detail-radio-group.component';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { MatButton } from '@angular/material/button';
import {
  CreateQuestionnaireGql,
  QuestionnairesByRoomIdDocument,
  QuestionnaireType,
} from '@gql/generated/graphql';

interface DialogData {
  roomId: string;
  type?: QuestionnaireType;
}

@Component({
  selector: 'app-questionnaire-creation',
  templateUrl: './questionnaire-creation.component.html',
  styleUrl: './questionnaire-creation.component.scss',
  imports: [
    FormsModule,
    CdkScrollable,
    MatDialogContent,
    FlexModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    DetailRadioGroupComponent,
    MatDialogActions,
    LoadingButtonComponent,
    MatButton,
    TranslocoPipe,
  ],
})
export class QuestionnaireCreationComponent {
  private readonly dialogRef =
    inject<MatDialogRef<QuestionnaireCreationComponent>>(MatDialogRef);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly contentGroupService = inject(ContentGroupService);
  private readonly createQuestionnaire = inject(CreateQuestionnaireGql);
  private readonly mutations = mutationHelper();
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly dialogId = 'create-content-group';

  nameInput = viewChild<ElementRef>('nameInput');
  name = '';

  selectedType = QuestionnaireType.Mixed;
  radioItems: DetailedRadioGroup[] = [];

  constructor() {
    this.contentGroupService
      .getQuestionnaireTypeIcons()
      .forEach((icon, type) => {
        const typeString = type.toLowerCase();
        const title = this.translateService.translate(
          'content.group-type-' + typeString
        );
        const description = this.translateService.translate(
          'creator.content.group-type-description-' + typeString
        );
        this.radioItems.push(
          new DetailedRadioGroup(
            type,
            title,
            description,
            icon,
            `var(--${typeString})`
          )
        );
      });
    this.selectedType = this.data.type ?? QuestionnaireType.Mixed;
  }

  changeType(type: string) {
    this.selectedType = type as QuestionnaireType;
  }

  addContentGroup() {
    if (this.name) {
      this.createQuestionnaire
        .mutate({
          variables: {
            input: {
              roomId: this.data.roomId,
              name: this.name,
              type: this.selectedType,
            },
          },
          refetchQueries: [QuestionnairesByRoomIdDocument],
        })
        .pipe(this.mutations.handleErrors())
        .subscribe({
          next: (r) => {
            const id = r.data?.createQuestionnaire.id;
            if (id) {
              this.translateService
                .selectTranslate('creator.room-page.content-group-created')
                .pipe(take(1))
                .subscribe((msg) => {
                  this.notificationService.showAdvanced(
                    msg,
                    AdvancedSnackBarTypes.SUCCESS
                  );
                });
              this.closeDialog(id, r.data?.createQuestionnaire.name);
            }
          },
        });
    } else {
      this.translateService
        .selectTranslate('creator.dialog.please-enter-name')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
          this.nameInput()?.nativeElement.focus();
        });
    }
  }

  closeDialog(id?: string, name?: string): void {
    this.dialogRef.close({ id: id, name: name });
  }
}
