import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Comment } from '@app/core/models/comment';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { take } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';

@Component({
  selector: 'app-present-comment',
  templateUrl: './present-comment.component.html',
  styleUrls: ['./present-comment.component.scss'],
  imports: [FlexModule, LanguageContextDirective, TranslocoPipe],
})
export class PresentCommentComponent implements OnInit, OnDestroy {
  private translateService = inject(TranslocoService);
  private presentationService = inject(PresentationService);
  private hotkeyService = inject(HotkeyService);

  @Input() isPresentation = false;
  @Input() comment?: Comment;

  currentZoom = 1;

  private hotkeyRefs: symbol[] = [];

  ngOnInit(): void {
    this.registerHotkeys();
    this.updateFontSize();
  }

  ngOnDestroy() {
    this.unregisterHotkeys();
  }

  registerHotkeys() {
    this.translateService
      .selectTranslate(['comment-page.zoom-in', 'comment-page.zoom-out'])
      .pipe(take(1))
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: '+',
            action: () => this.updateZoom(1),
            actionTitle: t[0],
          },
          this.hotkeyRefs
        );
        this.hotkeyService.registerHotkey(
          {
            key: '-',
            action: () => this.updateZoom(-1),
            actionTitle: t[1],
          },
          this.hotkeyRefs
        );
      });
  }

  unregisterHotkeys() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  updateFontSize(): void {
    const commentElement = document.getElementById('comment');
    if (commentElement) {
      commentElement.style.fontSize =
        'calc(' + this.currentZoom * 18 + 'px + 1.5vw)';
    }
    this.presentationService.updateCommentZoom(this.currentZoom * 100);
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
