import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-publish-content',
  templateUrl: './publish-content.component.html',
  styleUrls: ['./publish-content.component.scss']
})
export class PublishContentComponent {

  publishSingle = true;

  constructor(public dialogRef: MatDialogRef<PublishContentComponent>) {}

  close(submit: boolean) {
    const result = submit ? this.publishSingle : undefined;
    this.dialogRef.close(result);
  }

}
