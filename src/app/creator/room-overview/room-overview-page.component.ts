import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { takeUntil } from 'rxjs';
import { GroupType } from '@app/core/models/content-group';
import { HintType } from '@app/core/models/hint-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { FlexModule } from '@angular/flex-layout';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentsCardComponent } from '@app/standalone/feature-card/comments-card/comments-card.component';
import { LiveFeedbackCardComponent } from '@app/standalone/feature-card/live-feedback-card/live-feedback-card.component';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { MatButton } from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { MatCard } from '@angular/material/card';
import { MatRipple } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { AsyncPipe } from '@angular/common';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import { GlobalHintsComponent } from '@app/standalone/global-hints/global-hints.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ExpandableCardComponent } from '@app/standalone/expandable-card/expandable-card.component';

@Component({
  selector: 'app-creator-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['./room-overview-page.component.scss'],
  imports: [
    FlexModule,
    AutofocusDirective,
    LoadingIndicatorComponent,
    CommentsCardComponent,
    LiveFeedbackCardComponent,
    FeatureCardComponent,
    MatButton,
    HotkeyDirective,
    MatIcon,
    FeatureFlagDirective,
    MatCard,
    MatRipple,
    MatTooltip,
    ContentGroupsComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
    DisabledIfReadonlyDirective,
    GlobalHintsComponent,
    RenderedTextComponent,
    ExpandableCardComponent,
  ],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit, OnDestroy
{
  protected router = inject(Router);
  protected translateService = inject(TranslocoService);
  protected dialogService = inject(DialogService);
  protected globalStorageService = inject(GlobalStorageService);
  private contentService = inject(ContentService);

  // Route data input below
  @Input({ required: true }) userRole!: UserRole;

  groupTypes: Map<GroupType, string>;
  groupContentFormatIcons: Map<GroupType, Map<ContentType, string>> = new Map();
  hintType = HintType.INFO;

  constructor() {
    super();
    this.groupTypes = this.contentGroupService.getTypeIcons();
    this.groupTypes.forEach((value, key) => {
      const groupTypeIcons = new Map<ContentType, string>();
      this.contentService.getTypeIcons().forEach((icon, type) => {
        if (
          this.contentGroupService
            .getContentFormatsOfGroupType(key)
            .includes(type) &&
          type !== ContentType.SLIDE
        ) {
          groupTypeIcons.set(type, icon);
        }
      });
      this.groupContentFormatIcons.set(key, groupTypeIcons);
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.eventService
      .on<DataChanged<RoomStats>>('ModeratorDataChanged')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.initializeStats(true));
    this.initializeStats(true);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setGroupDataInGlobalStorage() {
    this.globalStorageService.setItem(
      STORAGE_KEYS.CONTENT_GROUPS,
      this.contentGroups.map((cg) => cg.name)
    );
  }

  openCreateContentGroupDialog(type = GroupType.MIXED) {
    this.dialogService
      .openContentGroupCreationDialog(this.room.id, type)
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          this.router.navigate(['edit', this.room.shortId, 'series', name]);
        }
      });
  }

  navigateToTemplateSelection() {
    this.router.navigate(['edit', this.room.shortId, 'templates']);
  }

  isModerator(): boolean {
    return this.userRole === UserRole.MODERATOR;
  }
}
