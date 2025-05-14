import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { takeUntil } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { MatCard } from '@angular/material/card';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AsyncPipe } from '@angular/common';
import { CoreModule } from '@app/core/core.module';
import { FlexModule } from '@angular/flex-layout';
import { CommentSettings } from '@app/core/models/comment-settings';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { CommentsCardComponent } from '@app/standalone/feature-card/comments-card/comments-card.component';
import { LiveFeedbackCardComponent } from '@app/standalone/feature-card/live-feedback-card/live-feedback-card.component';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
  imports: [
    FlexModule,
    CoreModule,
    LoadingIndicatorComponent,
    MatCard,
    ContentGroupsComponent,
    HintComponent,
    ExtensionPointModule,
    AsyncPipe,
    TranslocoPipe,
    FeatureCardComponent,
    RenderedTextComponent,
    CommentsCardComponent,
    LiveFeedbackCardComponent,
    LanguageContextDirective,
  ],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit, OnDestroy
{
  protected translateService = inject(TranslocoService);
  protected globalStorageService = inject(GlobalStorageService);
  protected commentSettingsService = inject(CommentSettingsService);
  protected focusModeService = inject(FocusModeService);
  private feedbackService = inject(FeedbackService);

  // Route data input below
  @Input({ required: true }) commentSettings!: CommentSettings;

  feedbackEnabled = false;
  commentsEnabled = false;
  focusModeEnabled = false;
  HintType = HintType;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.focusModeEnabled = this.room.focusModeEnabled;
    this.eventService
      .on<DataChanged<RoomStats>>('PublicDataChanged')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.initializeStats(false));
    this.initializeStats(false);
    this.feedbackEnabled = !this.room.settings.feedbackLocked;
    this.commentsEnabled = !this.commentSettings.disabled;
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.feedbackService
      .getMessages()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message) => {
        const type = JSON.parse(message.body).type;
        if (type === FeedbackMessageType.STARTED) {
          this.feedbackEnabled = true;
        } else if (type === FeedbackMessageType.STOPPED) {
          this.feedbackEnabled = false;
        }
      });
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.commentsEnabled = !settings.disabled;
      });
    this.focusModeService
      .getFocusModeEnabled()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (focusModeEnabled) => (this.focusModeEnabled = focusModeEnabled)
      );
  }

  setGroupDataInGlobalStorage() {
    if (
      this.contentGroups.length > 0 &&
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP) === ''
    ) {
      this.globalStorageService.setItem(
        STORAGE_KEYS.LAST_GROUP,
        this.contentGroups[0].name
      );
    } else {
      if (this.contentGroups.length === 0) {
        this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, '');
      }
    }
  }
}
