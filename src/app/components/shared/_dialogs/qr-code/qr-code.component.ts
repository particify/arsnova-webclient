import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {

  data: string;
  qrWidth: number;

  constructor(public dialogRef: MatDialogRef<HeaderComponent>) { }

  ngOnInit(): void {
    this.qrWidth = Math.min(document.body.clientWidth, document.body.clientHeight);
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
