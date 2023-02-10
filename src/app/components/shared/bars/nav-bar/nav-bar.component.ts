import { Component, OnDestroy, OnInit } from '@angular/core';
import { BarBaseComponent, BarItem } from '../bar-base';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../../services/util/global-storage.service';
import { UserRole } from '../../../../models/user-roles.enum';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { FeedbackMessageType } from '../../../../models/messages/feedback-message-type';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentGroup } from '../../../../models/content-group';
import { EventService } from '../../../../services/util/event.service';
import { Observable, Subscription } from 'rxjs';
import { EntityChanged } from '../../../../models/events/entity-changed';
import { ContentGroupStatistics } from '../../../../models/content-group-statistics';
import { DataChanged } from '../../../../models/events/data-changed';
import { RoomStats } from '../../../../models/room-stats';
import { Features } from '../../../../models/features.enum';
import { SeriesCreated } from '../../../../models/events/series-created';
import { SeriesDeleted } from '../../../../models/events/series-deleted';
import { MatMenuTrigger } from '@angular/material/menu';
import { RoomService } from '../../../../services/http/room.service';
import { IMessage } from '@stomp/stompjs';
import { CommentSettingsService } from '../../../../services/http/comment-settings.service';

export class NavBarItem extends BarItem {
  url: string;
  changeIndicator: boolean;

  constructor(
    name: string,
    icon: string,
    url: string,
    changeIndicator: boolean
  ) {
    super(name, icon);
    this.url = url;
    this.changeIndicator = changeIndicator;
  }
}

export class PublishedContentsState {
  groupName: string;
  firstContentPublished: number;
  lastContentPublished: number;

  constructor(
    groupName: string,
    firstContentPublished: number,
    lastContentPublished: number
  ) {
    this.groupName = groupName;
    this.firstContentPublished = firstContentPublished;
    this.lastContentPublished = lastContentPublished;
  }
}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent
  extends BarBaseComponent
  implements OnInit, OnDestroy
{
  barItems: NavBarItem[] = [];
  features: BarItem[] = [
    new BarItem(Features.OVERVIEW, 'home'),
    new BarItem(Features.COMMENTS, 'question_answer'),
    new BarItem(Features.CONTENTS, 'equalizer'),
    new BarItem(Features.FEEDBACK, 'thumbs_up_down'),
  ];
  currentRouteIndex: number;
  activeFeatures: string[] = [Features.OVERVIEW];
  group: ContentGroup;
  groupName: string;
  role: UserRole;
  viewRole: UserRole;
  shortId: string;
  roomId: string;
  changesSubscription: Subscription;
  statsChangesSubscription: Subscription;
  groupSubscriptions: Subscription[];
  feedbackSubscription: Subscription;
  commentSettingsSubscription: Subscription;
  contentGroups: ContentGroup[] = [];
  publishedStates: PublishedContentsState[] = [];
  focusStateSubscription: Subscription;
  isLoading = true;

  userCount: number;
  private roomSub: Subscription;
  private roomWatch: Observable<IMessage>;

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
    protected commentSettingsService: CommentSettingsService
  ) {
    super();
  }

  ngOnDestroy(): void {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.statsChangesSubscription) {
      this.statsChangesSubscription.unsubscribe();
    }
    if (this.groupSubscriptions) {
      for (const subscription of this.groupSubscriptions) {
        subscription.unsubscribe();
      }
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
  }

  afterInit() {
    // This function is implemented and used different in presentation control bar so this check is needed for now
    if (!this.isLoading) {
      return;
    }
    if (this.role === UserRole.PARTICIPANT) {
      this.subscribeToContentGroups();
    } else {
      this.subscribeToContentGroupEvents();
      this.roomService.getRoomSummaries([this.roomId]).subscribe((summary) => {
        this.userCount = summary[0].stats.roomUserCount;
        this.roomWatch = this.roomService.getCurrentRoomsMessageStream();
        this.roomSub = this.roomWatch.subscribe((msg) =>
          this.parseUserCount(msg.body)
        );
      });
    }
    this.isLoading = false;
  }

  initItems() {
    this.route.data.subscribe((data) => {
      this.role = data.userRole;
      this.viewRole = data.viewRole;
      this.shortId = data.room.shortId;
      this.roomId = data.room.id;
      if (
        !data.room.settings['feedbackLocked'] ||
        this.viewRole !== UserRole.PARTICIPANT
      ) {
        this.activeFeatures.splice(1, 0, Features.FEEDBACK);
      }
      if (
        !this.route.children[0]?.snapshot.data.commentSettings?.disabled ||
        this.viewRole !== UserRole.PARTICIPANT
      ) {
        this.activeFeatures.splice(1, 0, Features.COMMENTS);
      }
      this.feedbackService.startSub(this.roomId);
      let group = this.routingService.seriesName;
      if (group === undefined) {
        group = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
      } else {
        this.setGroupInSessionStorage(group);
      }
      this.roomStatsService
        .getStats(this.roomId, this.viewRole !== UserRole.PARTICIPANT)
        .subscribe((stats) => {
          if (stats.groupStats) {
            this.groupName = group || stats.groupStats[0].groupName;
            this.setGroupInSessionStorage(this.groupName);
            this.addContentFeatureItem(false);
          }
          this.getItems();
          this.updateGroups(stats.groupStats ?? [], !!group);
        });
      this.subscribeToParticipantEvents();
      this.subscribeToRouteChanges();
    });
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
            this.activeFeatures.push(Features.FEEDBACK);
            this.getItems();
            this.toggleNews(Features.FEEDBACK);
          } else if (type === FeedbackMessageType.STOPPED) {
            const index = this.activeFeatures.indexOf(Features.FEEDBACK);
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
            Features.COMMENTS
          );
          // Remove comment feature if disabled now enabled before
          if (commentsDisabled && isCommentFeatureActive) {
            const index = this.activeFeatures.indexOf(Features.COMMENTS);
            this.activeFeatures.splice(index, 1);
            this.getItems();
            // Add comment feature if enabled now and disabled before
          } else if (!commentsDisabled && !isCommentFeatureActive) {
            this.activeFeatures.splice(1, 0, Features.COMMENTS);
            this.getItems();
            this.toggleNews(Features.COMMENTS);
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
      if (this.currentRouteIndex > -1) {
        this.disableNewsForCurrentRoute();
      }
    });
  }

  subscribeToContentGroupEvents() {
    const createdEvent = new SeriesCreated();
    this.eventService
      .on<typeof createdEvent.payload>(createdEvent.type)
      .subscribe((group) => {
        this.roomStatsService.getStats(this.roomId, true).subscribe((stats) => {
          this.groupName = group.name;
          this.addContentFeatureItem();
          this.updateGroups(stats.groupStats, true);
        });
      });
    const deletedEvent = new SeriesDeleted();
    this.eventService
      .on<typeof deletedEvent.payload>(deletedEvent.type)
      .subscribe(() => {
        this.roomStatsService.getStats(this.roomId, true).subscribe((stats) => {
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
      barItem.name === Features.OVERVIEW &&
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
      if (this.groupName && feature === Features.CONTENTS) {
        url += this.getGroupUrl();
      }
      return url;
    } else {
      return '';
    }
  }

  getBaseUrl(): string {
    return `/${this.routingService.getRoleRoute(this.viewRole)}/${
      this.shortId
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
      this.shortId,
    ];
    if (item.name !== Features.OVERVIEW) {
      route.push(item.name);
      if (item.name === Features.CONTENTS) {
        route.push(this.groupName);
        if (this.isPresentation) {
          route.push('1');
        }
      }
    }
    this.router.navigate(route);
  }

  disableNewsForCurrentRoute() {
    this.barItems[this.currentRouteIndex].changeIndicator = false;
  }

  updateGroups(groupStats: ContentGroupStatistics[], alreadySet: boolean) {
    if (this.contentGroups.length > 0) {
      if (this.listObjectIdsEquals(this.contentGroups, groupStats)) {
        return;
      }
      this.resetGroups();
    }
    const groupCount = groupStats?.length ?? 0;
    if (groupCount > 0) {
      this.groupSubscriptions = [];
      for (let i = 0; i < groupCount; i++) {
        this.groupSubscriptions[i] = this.contentGroupService
          .getById(groupStats[i].id, { roomId: this.roomId })
          .subscribe((group) => {
            this.contentGroups.push(group);
            this.publishedStates.push(
              new PublishedContentsState(
                group.name,
                group.firstPublishedIndex,
                group.lastPublishedIndex
              )
            );
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
                if (this.role === UserRole.PARTICIPANT) {
                  this.toggleNews(Features.CONTENTS);
                }
                this.afterInit();
              } else {
                this.afterInit();
                this.setGroup();
              }
            }
          });
      }
    } else {
      this.afterInit();
      this.removeContentFeatureItem();
    }
  }

  addContentFeatureItem(getItemsAfterAdding = true) {
    if (this.getBarIndexOfFeature(Features.CONTENTS) === -1) {
      const newIndex = this.activeFeatures.includes(Features.COMMENTS) ? 2 : 1;
      this.activeFeatures.splice(newIndex, 0, Features.CONTENTS);
      if (getItemsAfterAdding) {
        this.getItems();
      }
    }
  }

  removeContentFeatureItem() {
    const index = this.activeFeatures.indexOf(Features.CONTENTS);
    if (index > -1) {
      this.activeFeatures.splice(index, 1);
      this.getItems();
      this.removeGroupInSessionStorage();
    }
  }

  resetGroups() {
    this.contentGroups.splice(0, this.contentGroups.length);
    this.groupSubscriptions.forEach((s) => s.unsubscribe());
    this.groupSubscriptions = [];
  }

  subscribeToContentGroups() {
    this.changesSubscription = this.eventService
      .on('EntityChanged')
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
    this.updateGroupName(this.groupName);
  }

  getFirstGroupWithPublishedContents(): ContentGroup {
    return (
      this.contentGroups.filter(
        (cg) =>
          !this.noContentsPublished(
            cg.firstPublishedIndex,
            cg.lastPublishedIndex
          )
      )[0] || this.contentGroups[0]
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
    this.groupName = this.group.name;
    this.setPublishedState(
      this.group.firstPublishedIndex,
      this.group.lastPublishedIndex
    );
  }

  setPublishedState(first: number, last: number) {
    const currentPublished = this.getCurrentPublishedState();
    currentPublished.firstContentPublished = first;
    currentPublished.lastContentPublished = last;
  }

  getBarIndexOfFeature(name: string): number {
    return this.barItems.map((b) => b.name).indexOf(name);
  }

  updateGroupName(name: string) {
    this.groupName = name;
    const groupBarIndex = this.getBarIndexOfFeature(Features.CONTENTS);
    if (this.barItems[groupBarIndex]) {
      this.barItems[groupBarIndex].url = `${this.getBaseUrl()}/${
        Features.CONTENTS
      }/${this.groupName}`;
    }
    this.setGroupInSessionStorage(this.groupName);
  }

  isAlreadyPublished(first: number, last: number) {
    const currentPublished = this.getCurrentPublishedState();
    const currentFirst = currentPublished.firstContentPublished;
    const currentLast = currentPublished.lastContentPublished;
    const rangeInRange = currentFirst <= first && currentLast >= last;
    const singleInRange =
      first === last && first <= currentLast && first >= currentFirst;
    return rangeInRange || singleInRange;
  }

  getCurrentPublishedState(): PublishedContentsState {
    return this.publishedStates.filter(
      (p) => p.groupName === this.groupName
    )[0];
  }

  noContentsPublished(first: number, last: number) {
    return first === -1 && last === -1;
  }

  checkContentPublishing(first: number, last: number, setNewState: boolean) {
    const currentPublished = this.getCurrentPublishedState();
    if (
      this.noContentsPublished(
        currentPublished.firstContentPublished,
        currentPublished.lastContentPublished
      ) ||
      (!this.noContentsPublished(first, last) &&
        !this.isAlreadyPublished(first, last))
    ) {
      this.toggleNews(Features.CONTENTS);
    }
    if (setNewState) {
      this.setPublishedState(first, last);
    }
  }

  toggleNews(feature: string) {
    const featureIndex = this.getBarIndexOfFeature(feature);
    if (featureIndex !== this.currentRouteIndex) {
      this.barItems[featureIndex].changeIndicator = true;
    }
  }

  handleContentGroupChanges(changes) {
    if (changes.entityType === 'ContentGroup') {
      const index = this.contentGroups
        .map((cg) => cg.id)
        .indexOf(changes.entity.id);
      if (index !== undefined) {
        this.contentGroups[index] = changes.entity;
      }
      if (this.groupName !== changes.entity.name) {
        if (
          changes.entity.published &&
          !this.noContentsPublished(
            changes.entity.firstPublishedIndex,
            changes.entity.lastPublishedIndex
          )
        ) {
          this.group = changes.entity;
          this.updateGroupName(changes.entity.name);
          this.checkChanges(changes);
        }
      } else {
        this.checkChanges(changes);
      }
    }
  }

  checkChanges(changes) {
    const changedEvent = new EntityChanged(
      'ContentGroup',
      changes.entity,
      changes.changedProperties
    );
    if (
      changedEvent.hasPropertyChanged('firstPublishedIndex') ||
      changedEvent.hasPropertyChanged('lastPublishedIndex')
    ) {
      this.checkContentPublishing(
        changedEvent.payload.entity.firstPublishedIndex,
        changedEvent.payload.entity.lastPublishedIndex,
        true
      );
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
        this.toggleNews(Features.CONTENTS);
      }
    }
  }

  private listObjectIdsEquals(obj1: { id: string }[], obj2: { id: string }[]) {
    return (
      JSON.stringify(obj1?.map((cg) => cg.id)) ===
      JSON.stringify(obj2?.map((cg) => cg.id))
    );
  }

  getFeatureText(feature: Features) {
    return feature === Features.CONTENTS && this.contentGroups.length === 1
      ? this.groupName
      : 'sidebar.' + feature;
  }

  isMenuActive(feature: string): boolean {
    return feature === Features.CONTENTS && this.contentGroups.length > 1;
  }

  checkMenu(feature: string, trigger: MatMenuTrigger) {
    if (!this.isMenuActive(feature)) {
      trigger.closeMenu();
    }
  }
}
