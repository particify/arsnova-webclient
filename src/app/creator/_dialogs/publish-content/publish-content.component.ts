import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentPublishActionType } from '@core/models/content-publish-action.enum';

type ActionType = 'lock' | 'publish';

@Component({
  selector: 'app-publish-content',
  templateUrl: './publish-content.component.html',
})
export class PublishContentComponent {
  readonly dialogId = 'publish-content';

  readonly actions: Record<ActionType, ContentPublishActionType[]> = {
    publish: [
      ContentPublishActionType.SINGLE,
      ContentPublishActionType.UP_TO_HERE,
    ],
    lock: [
      ContentPublishActionType.UP_TO_HERE,
      ContentPublishActionType.FROM_HERE,
    ],
  };
  selectedAction: ContentPublishActionType;

  constructor(
    public dialogRef: MatDialogRef<PublishContentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public actionType: ActionType
  ) {
    this.selectedAction = this.actions[actionType][0];
  }

  close(action?: ContentPublishActionType) {
    this.dialogRef.close(action);
  }
}
