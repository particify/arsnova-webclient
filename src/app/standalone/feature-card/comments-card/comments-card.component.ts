import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentSettings } from '@app/core/models/comment-settings';
import { CommentService } from '@app/core/services/http/comment.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { Message } from '@stomp/stompjs';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';

@Component({
  selector: 'app-comments-card',
  imports: [
    FeatureCardComponent,
    TranslocoPipe,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    FlexModule,
    DisabledIfReadonlyDirective,
  ],
  templateUrl: './comments-card.component.html',
})
export class CommentsCardComponent implements OnDestroy, OnInit {
  private notificationService = inject(NotificationService);
  private commentSettingsService = inject(CommentSettingsService);
  private commentService = inject(CommentService);
  private translateService = inject(TranslocoService);
  private wsCommentService = inject(WsCommentService);

  private destroyed$ = new Subject<void>();

  @Input({ required: true }) room!: Room;
  @Input({ required: true }) description!: string;
  @Input() showCount = false;
  @Input() clickable = false;
  @Input() showControls = false;

  commentSettings?: CommentSettings;
  commentCounter = 0;

  ngOnInit() {
    this.commentSettingsService
      .get(this.room.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.commentSettings = settings;
      });
    if (this.showCount) {
      this.commentService
        .countByRoomId(this.room.id, true)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((commentCounter) => {
          this.commentCounter = commentCounter;
        });
      this.wsCommentService
        .getCommentStream(this.room.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((message: Message) => {
          this.commentCounter =
            this.commentService.getUpdatedCommentCountWithMessage(
              this.commentCounter,
              message
            );
        });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toggleCommentFeature() {
    if (this.commentSettings) {
      const settings = this.commentSettings;
      settings.disabled = !settings.disabled;
      this.commentSettingsService.update(settings).subscribe((settings) => {
        this.commentSettings = settings;
        const state = settings.disabled ? 'comments-locked' : 'comments-opened';
        const msg = this.translateService.translate(
          'creator.room-page.' + state
        );
        this.notificationService.showAdvanced(
          msg,
          settings.disabled
            ? AdvancedSnackBarTypes.WARNING
            : AdvancedSnackBarTypes.SUCCESS
        );
      });
    }
  }
}
