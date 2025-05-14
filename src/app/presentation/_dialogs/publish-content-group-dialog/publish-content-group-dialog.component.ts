import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import {
  ContentGroup,
  PUBLISHING_MODE_ITEMS,
  PublishingMode,
  PublishingModeItem,
} from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-publish-content-group-dialog',
  templateUrl: './publish-content-group-dialog.component.html',
  styleUrl: './publish-content-group-dialog.component.scss',
  standalone: true,
  imports: [CoreModule, LoadingButtonComponent],
  providers: [provideTranslocoScope('creator')],
})
export class PublishContentGroupDialogComponent extends FormComponent {
  dialogRef =
    inject<MatDialogRef<PublishContentGroupDialogComponent>>(MatDialogRef);
  private data = inject<{
    contentGroup: ContentGroup;
  }>(MAT_DIALOG_DATA);
  private contentGroupService = inject(ContentGroupService);
  private contentPublishService = inject(ContentPublishService);

  readonly dialogId = 'publish-content';

  publishingModes = PUBLISHING_MODE_ITEMS;
  selectedMode?: PublishingModeItem;

  constructor() {
    super();
    this.publishingModes = PUBLISHING_MODE_ITEMS;
    this.selectedMode = this.publishingModes[0];
  }

  updatePublishingMode(): void {
    if (!this.selectedMode) {
      return;
    }
    this.disableForm();
    const changes: { published: boolean; publishingMode?: PublishingMode } = {
      published: true,
    };
    if (!this.isLive()) {
      changes.publishingMode = this.selectedMode.type;
    }
    this.contentGroupService
      .patchContentGroup(this.data.contentGroup, changes)
      .subscribe(
        () => {
          this.close(this.selectedMode?.type);
        },
        () => this.enableForm()
      );
  }

  close(publishingMode?: PublishingMode) {
    this.dialogRef.close(publishingMode);
  }

  isLive(): boolean {
    return this.contentPublishService.isGroupLive(this.data.contentGroup);
  }
}
