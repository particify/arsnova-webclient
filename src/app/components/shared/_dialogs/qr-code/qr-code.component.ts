import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

export interface DialogData {
  protocol: string;
  hostName: string;
  shortId: string;
  isCreator: boolean;
}


@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {


  path = '/participant/room/';
  qrWidth: number;

  constructor(public dialogRef: MatDialogRef<QrCodeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              protected notification: NotificationService,
              protected translateService: TranslateService) {}

  ngOnInit(): void {
    const minSize = Math.min(document.body.clientWidth, document.body.clientHeight);
    this.qrWidth = minSize * 0.8;
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  copyShortId(): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.data.protocol + this.data.hostName + this.path + this.data.shortId;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.translateService.get('header.session-id-copied').subscribe(msg => {
      this.notification.show(msg, '', { duration: 2000 });
    });
  }
}
