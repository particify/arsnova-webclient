import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-publish-content',
  templateUrl: './publish-content.component.html',
  styleUrls: ['./publish-content.component.scss']
})
export class PublishContentComponent {
  readonly dialogId = 'publish-content';

  publishSingle = true;

  constructor(public dialogRef: MatDialogRef<PublishContentComponent>) {}

  close(submit: boolean) {
    const result = submit ? this.publishSingle : undefined;
    this.dialogRef.close(result);
  }

}
