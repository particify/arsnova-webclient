import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HotkeyService } from '@core/services/util/hotkey.service';
import { TranslateService } from '@ngx-translate/core';
import { Comment } from '@core/models/comment';
import { EventService } from '@core/services/util/event.service';
import { PresentationEvent } from '@core/models/events/presentation-events.enum';

@Component({
  selector: 'app-present-comment',
  templateUrl: './present-comment.component.html',
  styleUrls: ['./present-comment.component.scss'],
})
export class PresentCommentComponent implements OnInit, OnDestroy {
  @Input() isPresentation = false;
  @Input() comment: Comment;

  currentZoom = 1;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private translateService: TranslateService,
    private eventService: EventService,
    private hotkeyService: HotkeyService
  ) {}

  ngOnInit(): void {
    this.registerHotkeys();
    this.updateFontSize();
  }

  ngOnDestroy() {
    this.unregisterHotkeys();
  }

  registerHotkeys() {
    this.translateService
      .get(['comment-page.zoom-in', 'comment-page.zoom-out'])
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: '+',
            action: () => this.updateZoom(1),
            actionTitle: t['comment-page.zoom-in'],
          },
          this.hotkeyRefs
        );
        this.hotkeyService.registerHotkey(
          {
            key: '-',
            action: () => this.updateZoom(-1),
            actionTitle: t['comment-page.zoom-out'],
          },
          this.hotkeyRefs
        );
      });
  }

  unregisterHotkeys() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  updateFontSize(): void {
    document.getElementById('comment').style.fontSize =
      'calc(' + this.currentZoom * 18 + 'px + 1.5vw)';
    this.eventService.broadcast(
      PresentationEvent.COMMENT_ZOOM_UPDATED,
      this.currentZoom * 100
    );
  }

  updateZoom(adjustment: number) {
    if (
      (this.currentZoom > 0.6 && adjustment === -1) ||
      (this.currentZoom < 1.5 && adjustment === 1)
    ) {
      this.currentZoom += adjustment * 0.1;
      this.updateFontSize();
    }
  }
}
