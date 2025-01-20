import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { EventService } from '@app/core/services/util/event.service';
import { Observable, Subject, Subscription, map, takeUntil } from 'rxjs';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { SeriesCreated } from '@app/core/models/events/series-created';
import { SeriesDeleted } from '@app/core/models/events/series-deleted';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { RoomService } from '@app/core/services/http/room.service';
import { IMessage } from '@stomp/stompjs';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { Room } from '@app/core/models/room';
import { EntityChangedPayload } from '@app/core/models/events/entity-changed-payload';
import { TranslocoPipe } from '@jsverse/transloco';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';

export class NavBarItem {
  name: string;
  icon: string;
  url?: string;
  changeIndicator?: boolean;

  constructor(
    name: string,
    icon: string,
    url?: string,
    changeIndicator?: boolean
  ) {
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.changeIndicator = changeIndicator;
  }
}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  providers: [FocusModeService],
  imports: [
    FlexModule,
    MatButton,
    NgClass,
    MatTooltip,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    TextOverflowClipComponent,
    TranslocoPipe,
  ],
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) viewRole!: UserRole;
  @Input({ required: true }) room!: Room;
  destroyed$ = new Subject<void>();
  barItems: NavBarItem[] = [];
  features: NavBarItem[] = [
    new NavBarItem(RoutingFeature.OVERVIEW, 'home'),
    new NavBarItem(RoutingFeature.COMMENTS, 'question_answer'),
    new NavBarItem(RoutingFeature.CONTENTS, 'equalizer'),
    new NavBarItem(RoutingFeature.FEEDBACK, 'thumbs_up_down'),
  ];
  currentRouteIndex = -1;
  activeFeatures: string[] = [RoutingFeature.OVERVIEW];
  group?: ContentGroup;
  groupName?: string;
  private changesSubscription?: Subscription;
  private statsChangesSubscription?: Subscription;
  private feedbackSubscription?: Subscription;
  private commentSettingsSubscription?: Subscription;
  contentGroups: ContentGroup[] = [];
  private focusStateSubscription?: Subscription;
  isLoading = true;

  userCount = 1;
  focusFeature?: RoutingFeature;
  focusModeEnabled = false;
  private roomSub?: Subscription;
  private roomWatch?: Observable<IMessage>;

  constructor(
    protected router: Router,
    protected routingService: RoutingService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected roomStatsService: RoomStatsService,
    protected feedbackService: FeedbackService,
    protected contentGroupService: ContentGroupService,
    protected eventService: EventService,
    protected roomService: RoomService,
    protected commentSettingsService: CommentSettingsService,
    protected focusModeService: FocusModeService
  ) {}

  ngOnDestroy(): void {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.statsChangesSubscription) {
      this.statsChangesSubscription.unsubscribe();
    }
    if (this.feedbackSubscription) {
      this.feedbackSubscription.unsubscribe();
    }
    if (this.commentSettingsSubscription) {
      this.commentSettingsSubscription.unsubscribe();
    }
    if (this.focusStateSubscription) {
      this.focusStateSubscription.unsubscribe();
    }
    if (this.roomSub) {
      this.roomSub.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit() {
    if (
      !this.room.settings.feedbackLocked ||
      this.viewRole !== UserRole.PARTICIPANT
    ) {
      this.activeFeatures.splice(1, 0, RoutingFeature.FEEDBACK);
    }
    if (
      !this.route.children[0]?.snapshot.data.commentSettings?.disabled ||
      this.viewRole !== UserRole.PARTICIPANT
    ) {
      this.activeFeatures.splice(1, 0, RoutingFeature.COMMENTS);
    }
    this.feedbackService.startSub(this.room.id);
    let group = this.routingService.seriesName;
    if (group === undefined) {
      group = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
    } else {
      this.setGroupInSessionStorage(group);
    }
    this.roomStatsService
      .getStats(this.room.id, this.viewRole !== UserRole.PARTICIPANT)
      .subscribe((stats) => {
        if (stats.groupStats) {
          this.groupName = group || stats.groupStats[0].groupName;
          this.setGroupInSessionStorage(this.groupName);
          this.addContentFeatureItem(false);
        }
        this.getItems();
        this.updateGroups(stats.groupStats ?? [], !!group, false);
      });
    this.subscribeToParticipantEvents();
    this.subscribeToRouteChanges();
  }

  afterInit() {
    // This function is implemented and used different in presentation control bar so this check is needed for now
    if (!this.isLoading) {
      return;
    }
    if (this.userRole === UserRole.PARTICIPANT) {
      this.subscribeToContentGroups();
    } else {
      this.subscribeToContentGroupEvents();
      this.roomService.getRoomSummaries([this.room.id]).subscribe((summary) => {
        this.userCount = summary[0].stats.roomUserCount;
        this.roomWatch = this.roomService.getCurrentRoomsMessageStream();
        this.roomSub = this.roomWatch.subscribe((msg) =>
          this.parseUserCount(msg.body)
        );
      });
      this.focusModeService.init(this.room);
      this.focusModeService
        .getFocusModeEnabled()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((focusModeEnabled) => {
          setTimeout(() => {
            this.focusModeEnabled = focusModeEnabled;
          }, 300);
        });
      this.focusModeService
        .getState()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((state) => {
          if (state) {
            this.focusFeature =
              RoutingFeature[state?.feature as keyof typeof RoutingFeature];
          } else {
            this.focusFeature = RoutingFeature.OVERVIEW;
          }
        });
    }
    this.isLoading = false;
  }

  parseUserCount(body: string) {
    this.userCount = JSON.parse(body).UserCountChanged.userCount;
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }

  removeGroupInSessionStorage() {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
  }

  subscribeToParticipantEvents() {
    if (this.viewRole === UserRole.PARTICIPANT) {
      this.feedbackSubscription = this.feedbackService.messageEvent.subscribe(
        (message) => {
          const type = JSON.parse(message.body).type;
          if (type === FeedbackMessageType.STARTED) {
            this.activeFeatures.push(RoutingFeature.FEEDBACK);
            this.getItems();
            this.toggleNews(RoutingFeature.FEEDBACK);
          } else if (type === FeedbackMessageType.STOPPED) {
            const index = this.activeFeatures.indexOf(RoutingFeature.FEEDBACK);
            this.activeFeatures.splice(index, 1);
            this.getItems();
          }
        }
      );
      this.commentSettingsSubscription = this.commentSettingsService
        .getSettingsStream()
        .subscribe((settings) => {
          const commentsDisabled = settings.disabled;
          const isCommentFeatureActive = this.activeFeatures.includes(
            RoutingFeature.COMMENTS
          );
          // Remove comment feature if disabled now enabled before
          if (commentsDisabled && isCommentFeatureActive) {
            const index = this.activeFeatures.indexOf(RoutingFeature.COMMENTS);
            this.activeFeatures.splice(index, 1);
            this.getItems();
            // Add comment feature if enabled now and disabled before
          } else if (!commentsDisabled && !isCommentFeatureActive) {
            this.activeFeatures.splice(1, 0, RoutingFeature.COMMENTS);
            this.getItems();
            this.toggleNews(RoutingFeature.COMMENTS);
          }
        });
    }
  }

  subscribeToRouteChanges() {
    this.routingService.getRouteChanges().subscribe((route) => {
      const newGroup = route.params['seriesName'];
      if (newGroup && newGroup !== this.groupName) {
        this.updateGroupName(newGroup);
      }
      this.getCurrentRouteIndex();
      if (this.currentRouteIndex && this.currentRouteIndex > -1) {
        this.disableNewsForCurrentRoute();
      }
    });
  }

  subscribeToContentGroupEvents() {
    const createdEvent = new SeriesCreated(new ContentGroup());
    this.eventService
      .on<typeof createdEvent.payload>(createdEvent.type)
      .subscribe((group) => {
        this.roomStatsService
          .getStats(this.room.id, true)
          .subscribe((stats) => {
            this.groupName = group.name;
            this.addContentFeatureItem();
            this.updateGroups(stats.groupStats, true);
          });
      });
    const deletedEvent = new SeriesDeleted();
    this.eventService
      .on<typeof deletedEvent.payload>(deletedEvent.type)
      .subscribe(() => {
        this.roomStatsService
          .getStats(this.room.id, true)
          .subscribe((stats) => {
            if (!stats.groupStats) {
              this.removeContentFeatureItem();
            }
            this.updateGroups(stats.groupStats, false);
          });
      });
  }

  getItems() {
    for (const feature of this.features) {
      const url = this.getBaseUrl() + this.getFeatureUrl(feature.name);
      const index = this.activeFeatures.indexOf(feature.name);
      const barIndex = this.barItems.map((b) => b.name).indexOf(feature.name);
      if (index > -1) {
        if (barIndex < 0) {
          this.barItems.splice(
            index,
            0,
            new NavBarItem(feature.name, feature.icon, url, false)
          );
        }
      } else {
        if (barIndex > -1) {
          this.barItems.splice(barIndex, 1);
        }
      }
    }
    this.getCurrentRouteIndex();
  }

  getCurrentRouteIndex() {
    const matchingRoutes = this.barItems.filter((b) => this.isRouteMatching(b));
    if (matchingRoutes.length > 0) {
      this.currentRouteIndex = this.barItems
        .map((s) => s.url)
        .indexOf(matchingRoutes[matchingRoutes.length - 1].url);
    } else {
      this.currentRouteIndex = -1;
    }
  }

  isRouteMatching(barItem: NavBarItem): boolean {
    if (
      barItem.name === RoutingFeature.OVERVIEW &&
      this.router.url === this.getBaseUrl()
    ) {
      return true;
    }
    const urlTree = this.router.createUrlTree([barItem.url]);
    return this.router.url.includes(this.router.serializeUrl(urlTree));
  }

  getFeatureUrl(feature: string): string {
    if (feature) {
      let url = '/' + feature;
      if (this.groupName && feature === RoutingFeature.CONTENTS) {
        url += this.getGroupUrl();
      }
      return url;
    } else {
      return '';
    }
  }

  getBaseUrl(): string {
    return `/${this.routingService.getRoleRoute(this.viewRole)}/${
      this.room.shortId
    }`;
  }

  getGroupUrl() {
    return '/' + this.groupName;
  }

  navToUrl(index: number, newGroup?: ContentGroup) {
    const item = this.barItems[index];
    if (newGroup) {
      this.setGroup(newGroup);
    } else {
      if (this.isMenuActive(item.name)) {
        return;
      }
    }
    const route = [
      this.routingService.getRoleRoute(this.viewRole),
      this.room.shortId,
    ];
    if (item.name !== RoutingFeature.OVERVIEW) {
      route.push(item.name);
      if (item.name === RoutingFeature.CONTENTS && this.groupName) {
        route.push(this.groupName);
      }
    }
    this.router.navigate(route);
  }

  disableNewsForCurrentRoute() {
    if (this.currentRouteIndex) {
      this.barItems[this.currentRouteIndex].changeIndicator = false;
    }
  }

  updateGroups(
    groupStats: ContentGroupStatistics[],
    alreadySet: boolean,
    showNews = true
  ) {
    if (this.contentGroups.length > 0) {
      if (this.listObjectIdsEquals(this.contentGroups, groupStats)) {
        return;
      }
      this.resetGroups();
    }
    const groupCount = groupStats?.length ?? 0;
    if (groupCount > 0) {
      this.contentGroupService
        .getByIds(
          groupStats.map((stats) => stats.id),
          { roomId: this.room.id }
        )
        .subscribe((groups) => {
          for (const group of groups) {
            this.contentGroups.push(group);
            if (this.contentGroups.length === groupCount) {
              this.contentGroups =
                this.contentGroupService.sortContentGroupsByName(
                  this.contentGroups
                );
              if (alreadySet) {
                const currentGroup =
                  this.contentGroups.find((c) => c.name === this.groupName) ||
                  this.contentGroups[0];
                this.setGroup(currentGroup);
                this.addContentFeatureItem();
                // route data's `userRole` is used here to prevent showing notification indicator in creators room preview
                if (this.userRole === UserRole.PARTICIPANT && showNews) {
                  this.toggleNews(RoutingFeature.CONTENTS);
                }
                this.afterInit();
              } else {
                this.afterInit();
                this.setGroup();
              }
            }
          }
        });
    } else {
      this.afterInit();
      this.removeContentFeatureItem();
    }
  }

  addContentFeatureItem(getItemsAfterAdding = true) {
    if (this.getBarIndexOfFeature(RoutingFeature.CONTENTS) === -1) {
      const newIndex = this.activeFeatures.includes(RoutingFeature.COMMENTS)
        ? 2
        : 1;
      this.activeFeatures.splice(newIndex, 0, RoutingFeature.CONTENTS);
      if (getItemsAfterAdding) {
        this.getItems();
      }
    }
  }

  removeContentFeatureItem() {
    const index = this.activeFeatures.indexOf(RoutingFeature.CONTENTS);
    if (index > -1) {
      this.activeFeatures.splice(index, 1);
      this.getItems();
      this.removeGroupInSessionStorage();
    }
  }

  resetGroups() {
    this.contentGroups.splice(0, this.contentGroups.length);
  }

  subscribeToContentGroups() {
    this.changesSubscription = this.eventService
      .on('EntityChanged')
      .pipe(map((changes) => changes as EntityChangedPayload<ContentGroup>))
      .subscribe((changes) => {
        this.handleContentGroupChanges(changes);
      });
    const changeEventType =
      this.viewRole === UserRole.PARTICIPANT
        ? 'PublicDataChanged'
        : 'ModeratorDataChanged';
    this.statsChangesSubscription = this.eventService
      .on<DataChanged<RoomStats>>(changeEventType)
      .subscribe((event) =>
        this.updateGroups(event.payload.data.groupStats, true)
      );
  }

  setGroup(group?: ContentGroup) {
    this.group = group || this.getFirstGroupWithPublishedContents();
    this.setGroupProperties();
    if (this.groupName) {
      this.updateGroupName(this.groupName);
    }
  }

  getFirstGroupWithPublishedContents(): ContentGroup {
    return (
      this.contentGroups.filter((cg) => cg.published)[0] ||
      this.contentGroups[0]
    );
  }

  filterPublishedGroups(): boolean {
    this.contentGroups = this.contentGroups.filter((cg) => cg.published);
    if (this.contentGroups.length === 0) {
      this.removeContentFeatureItem();
      return false;
    } else {
      return true;
    }
  }

  setGroupProperties() {
    if (this.group) {
      this.groupName = this.group.name;
    }
  }

  getBarIndexOfFeature(name: string): number {
    return this.barItems.map((b) => b.name).indexOf(name);
  }

  updateGroupName(name: string) {
    this.groupName = name;
    const groupBarIndex = this.getBarIndexOfFeature(RoutingFeature.CONTENTS);
    if (this.barItems[groupBarIndex]) {
      this.barItems[groupBarIndex].url = `${this.getBaseUrl()}/${
        RoutingFeature.CONTENTS
      }/${this.groupName}`;
    }
    this.setGroupInSessionStorage(this.groupName);
  }

  noContentsPublished(first: number, last: number) {
    return first === -1 && last === -1;
  }

  toggleNews(feature: string) {
    const featureIndex = this.getBarIndexOfFeature(feature);
    if (featureIndex !== this.currentRouteIndex) {
      this.barItems[featureIndex].changeIndicator = true;
    }
  }

  handleContentGroupChanges(changes: EntityChangedPayload<ContentGroup>) {
    if (changes.entityType === 'ContentGroup') {
      const index = this.contentGroups
        .map((cg) => cg.id)
        .indexOf(changes.entity.id);
      if (index !== undefined) {
        this.contentGroups[index] = changes.entity;
      }
      if (this.groupName !== changes.entity.name) {
        if (changes.entity.published) {
          this.group = changes.entity;
          this.updateGroupName(changes.entity.name);
          this.checkChanges(changes);
        }
      } else {
        this.checkChanges(changes);
      }
    }
  }

  checkChanges(changes: EntityChangedPayload<ContentGroup>) {
    const changedEvent = new EntityChanged(
      'ContentGroup',
      changes.entity,
      changes.changedProperties
    );
    if (changedEvent.hasPropertyChanged('publishingIndex')) {
      this.toggleNews(RoutingFeature.CONTENTS);
    }
    if (changedEvent.hasPropertyChanged('name')) {
      this.updateGroupName(changes.entity.name);
    }
    if (changedEvent.hasPropertyChanged('published')) {
      if (!changes.entity.published) {
        if (this.filterPublishedGroups()) {
          this.setGroup();
        }
      } else {
        this.addContentFeatureItem();
        this.toggleNews(RoutingFeature.CONTENTS);
      }
    }
  }

  private listObjectIdsEquals(obj1: { id: string }[], obj2: { id: string }[]) {
    return (
      JSON.stringify(obj1?.map((cg) => cg.id)) ===
      JSON.stringify(obj2?.map((cg) => cg.id))
    );
  }

  getFeatureText(feature: string) {
    return feature === RoutingFeature.CONTENTS &&
      this.contentGroups.length === 1
      ? this.groupName
      : 'sidebar.' + feature;
  }

  isMenuActive(feature: string): boolean {
    return feature === RoutingFeature.CONTENTS && this.contentGroups.length > 1;
  }

  checkMenu(feature: string, trigger: MatMenuTrigger) {
    if (!this.isMenuActive(feature)) {
      trigger.closeMenu();
    }
  }

  getFocusInfo(feature: string) {
    if (!this.focusModeEnabled) {
      return '';
    }
    return feature === this.focusFeature ? 'creator.sidebar.focus-feature' : '';
  }
}
