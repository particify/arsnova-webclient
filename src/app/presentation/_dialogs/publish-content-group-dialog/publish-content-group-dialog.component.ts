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
  ToggleQuestionnairePublishedGql,
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
  private readonly toggleQuestionnairePublished = inject(
    ToggleQuestionnairePublishedGql
  );

  readonly dialogId = 'publish-content';

  publishingModes = PUBLISHING_MODE_ITEMS;

  isLive = computed(
    () => this.data.publishingMode === QuestionnairePublishingMode.Live
  );
  selectedMode = linkedSignal(() => this.publishingModes[0]);

  constructor() {
    super();
  }

  updatePublishingMode(): void {
    if (!this.selectedMode && !this.isLive) {
      return;
    }
    this.toggleQuestionnairePublished
      .mutate({
        variables: { id: this.data.questionnaireId, published: true },
      })
      .subscribe({
        next: () => this.close(this.selectedMode().type),
      });
  }

  close(publishingMode?: QuestionnairePublishingMode) {
    this.dialogRef.close(publishingMode);
  }
}
