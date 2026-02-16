import { Component, OnInit, computed, inject, input } from '@angular/core';
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
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ExpandableCardComponent } from '@app/standalone/expandable-card/expandable-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    RenderedTextComponent,
    ExpandableCardComponent,
  ],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit
{
  protected readonly router = inject(Router);
  protected readonly translateService = inject(TranslocoService);
  protected readonly dialogService = inject(DialogService);
  protected readonly globalStorageService = inject(GlobalStorageService);
  private readonly contentService = inject(ContentService);

  // Route data input below
  readonly userRole = input.required<UserRole>();

  readonly isModerator = computed(() => this.userRole() === UserRole.MODERATOR);

  groupTypes: Map<GroupType, string>;
  readonly groupContentFormatIcons = new Map<
    GroupType,
    Map<ContentType, string>
  >();
  readonly hintType = HintType.INFO;
  expandDescription: boolean;

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
    const expandDescription = this.globalStorageService.getItem(
      STORAGE_KEYS.EXPAND_ROOM_DESCRIPTION
    );
    this.expandDescription = expandDescription;
    if (expandDescription) {
      this.globalStorageService.removeItem(
        STORAGE_KEYS.EXPAND_ROOM_DESCRIPTION
      );
    }
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.eventService
      .on<DataChanged<RoomStats>>('ModeratorDataChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initializeStats(true));
    this.initializeStats(true);
  }

  setGroupDataInGlobalStorage() {
    this.globalStorageService.setItem(
      STORAGE_KEYS.CONTENT_GROUPS,
      this.contentGroups.map((cg) => cg.name)
    );
  }

  openCreateContentGroupDialog(type = GroupType.MIXED) {
    this.dialogService
      .openContentGroupCreationDialog(this.legacyRoom().id, type)
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          this.router.navigate(['edit', this.shortId(), 'series', name]);
        }
      });
  }

  navigateToTemplateSelection() {
    this.router.navigate(['edit', this.shortId(), 'templates']);
  }
}
