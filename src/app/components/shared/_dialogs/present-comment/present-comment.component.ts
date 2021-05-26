import { Component, HostListener, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { KeyboardKey } from '../../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { Comment } from '../../../../models/comment';
import { EventService } from '../../../../services/util/event.service';

@Component({
  selector: 'app-present-comment',
  templateUrl: './present-comment.component.html',
  styleUrls: ['./present-comment.component.scss']
})
export class PresentCommentComponent implements OnInit {

  @Input() isPresentation = false;
  @Input() comment: Comment;

  currentZoom = 1;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public dialogRef: MatDialogRef<PresentCommentComponent>,
    private translateService: TranslateService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private globalStorageService: GlobalStorageService,
    private eventService: EventService
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.PLUS) === true) {
      this.updateZoom(1);
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.MINUS) === true) {
      this.updateZoom(-1);
    }
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.updateFontSize();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // ToDo: migrate from deprecated event api
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.onCloseClick();
    }
  }

  onCloseClick(): void {
    this.dialogRef.close('close');
  }

  updateZoomWithSlider(event: any): void {
    this.currentZoom = event.value;
    this.updateFontSize();
  }

  updateFontSize(): void {
    document.getElementById('comment').style.fontSize = (this.currentZoom * 2.5) + 'em';
    this.eventService.broadcast('CommentZoomChanged', this.currentZoom * 100);
  }

  updateZoom(adjustment: number) {
    if ((this.currentZoom > 0.6 && adjustment === -1) || (this.currentZoom < 1.5 && adjustment === 1)) {
      this.currentZoom += (adjustment * 0.1);
      this.updateFontSize();
    }
  }
}
