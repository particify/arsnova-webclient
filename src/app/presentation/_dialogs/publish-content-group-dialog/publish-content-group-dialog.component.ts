import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
  linkedSignal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  QuestionnairePublishingMode,
  UpdateQuestionnaireGql,
} from '@gql/generated/graphql';
import { provideTranslocoScope } from '@jsverse/transloco';

interface PublishingModeItem {
  type: QuestionnairePublishingMode;
  name: string;
  icon: string;
}

const PUBLISHING_MODE_ITEMS: PublishingModeItem[] = [
  { type: QuestionnairePublishingMode.All, name: 'all', icon: 'lock_open' },
  { type: QuestionnairePublishingMode.UpTo, name: 'up-to', icon: 'expand_all' },
];
@Component({
  selector: 'app-publish-content-group-dialog',
  templateUrl: './publish-content-group-dialog.component.html',
  styleUrl: './publish-content-group-dialog.component.scss',
  standalone: true,
  imports: [CoreModule, LoadingButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('creator')],
})
export class PublishContentGroupDialogComponent extends FormComponent {
  dialogRef =
    inject<MatDialogRef<PublishContentGroupDialogComponent>>(MatDialogRef);
  private data = inject<{
    questionnaireId: string;
    publishingMode: QuestionnairePublishingMode;
  }>(MAT_DIALOG_DATA);
  private readonly updateQuestionnaire = inject(UpdateQuestionnaireGql);

  readonly dialogId = 'publish-content';

  publishingModes = PUBLISHING_MODE_ITEMS;

  isLive = computed(
    () => this.data.publishingMode === QuestionnairePublishingMode.Live
  );
  selectedMode = linkedSignal(() => this.publishingModes[0]);

  constructor() {
    super();
  }

  /** A live questionnaire keeps its mode; otherwise the chosen one applies. */
  updatePublishingMode(): void {
    const publishingMode = this.isLive()
      ? QuestionnairePublishingMode.Live
      : this.selectedMode().type;
    this.disableForm();
    this.updateQuestionnaire
      .mutate({
        variables: {
          id: this.data.questionnaireId,
          published: true,
          publishingMode,
        },
      })
      .subscribe({
        next: () => this.close(publishingMode),
        error: () => this.enableForm(),
      });
  }

  close(publishingMode?: QuestionnairePublishingMode) {
    this.dialogRef.close(publishingMode);
  }
}
