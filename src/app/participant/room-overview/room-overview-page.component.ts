import { Component, OnInit, inject, input } from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
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
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AsyncPipe } from '@angular/common';
import { CoreModule } from '@app/core/core.module';
import { FlexModule } from '@angular/flex-layout';
import { CommentSettings } from '@app/core/models/comment-settings';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { CommentsCardComponent } from '@app/standalone/feature-card/comments-card/comments-card.component';
import { LiveFeedbackCardComponent } from '@app/standalone/feature-card/live-feedback-card/live-feedback-card.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomInfoComponentComponent } from '@app/standalone/room-info-component/room-info-component.component';
import { ExpandableCardComponent } from '@app/standalone/expandable-card/expandable-card.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
  imports: [
    FlexModule,
    CoreModule,
    LoadingIndicatorComponent,
    ContentGroupsComponent,
    ExtensionPointModule,
    AsyncPipe,
    TranslocoPipe,
    FeatureCardComponent,
    RenderedTextComponent,
    CommentsCardComponent,
    LiveFeedbackCardComponent,
    LanguageContextDirective,
    RoomInfoComponentComponent,
    ExpandableCardComponent,
  ],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit
{
  protected readonly translateService = inject(TranslocoService);
  protected readonly globalStorageService = inject(GlobalStorageService);
  protected readonly commentSettingsService = inject(CommentSettingsService);
  protected readonly focusModeService = inject(FocusModeService);
  private readonly roomSettingsService = inject(RoomSettingsService);

  // Route data input below
  readonly commentSettings = input.required<CommentSettings>();

  feedbackEnabled = false;
  commentsEnabled = false;
  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());
  readonly HintType = HintType;

  ngOnInit() {
    window.scroll(0, 0);
    this.eventService
      .on<DataChanged<RoomStats>>('PublicDataChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initializeStats(false));
    this.initializeStats(false);
    this.roomSettingsService
      .getByRoomId(this.roomId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings) => {
        this.feedbackEnabled = settings.surveyEnabled;
        this.roomSettingsService
          .getRoomSettingsStream(this.roomId(), settings.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((settings) => {
            if (settings.surveyEnabled !== undefined) {
              this.feedbackEnabled = settings.surveyEnabled;
            }
          });
      });
    this.commentsEnabled = !this.commentSettings().disabled;
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings) => {
        this.commentsEnabled = !settings.disabled;
      });
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
