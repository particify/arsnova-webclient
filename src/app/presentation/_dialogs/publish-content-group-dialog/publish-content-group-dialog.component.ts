import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ContentGroup,
  PUBLISHING_MODE_ITEMS,
  PublishingMode,
  PublishingModeItem,
} from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';

@Component({
  selector: 'app-publish-content-group-dialog',
  templateUrl: './publish-content-group-dialog.component.html',
  styleUrl: './publish-content-group-dialog.component.scss',
})
export class PublishContentGroupDialogComponent extends FormComponent {
  readonly dialogId = 'publish-content';

  publishingModes = PUBLISHING_MODE_ITEMS;
  selectedMode?: PublishingModeItem;

  constructor(
    public dialogRef: MatDialogRef<PublishContentGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { contentGroup: ContentGroup },
    private contentGroupService: ContentGroupService,
    protected formService: FormService
  ) {
    super(formService);
    this.publishingModes = this.publishingModes.filter(
      (m) => m.type !== PublishingMode.NONE
    );
    this.selectedMode = this.publishingModes[0];
  }

  updatePublishingMode(): void {
    if (!this.selectedMode) {
      return;
    }
    this.disableForm();
    const changes = { publishingMode: this.selectedMode.type };
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
}
