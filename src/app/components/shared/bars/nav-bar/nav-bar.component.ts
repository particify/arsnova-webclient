import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { BarBaseComponent, BarItem } from '../bar-base';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { UserRole } from '../../../../models/user-roles.enum';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { FeedbackMessageType } from '../../../../models/messages/feedback-message-type';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentGroup } from '../../../../models/content-group';
import { EventService } from '../../../../services/util/event.service';
import { Subscription } from 'rxjs';
import { EntityChanged } from '../../../../models/events/entity-changed';
import { ContentGroupStatistics } from '../../../../models/content-group-statistics';
import { DataChanged } from '../../../../models/events/data-changed';
import { RoomStats } from '../../../../models/room-stats';
import { Features } from '../../../../models/features.enum';
import { RemoteMessage } from '../../../../models/events/remote/remote-message.enum';
import { UiState } from '../../../../models/events/ui/ui-state.enum';

export class NavBarItem extends BarItem {

  url: string;
  changeIndicator: boolean;

  constructor(name: string, icon: string, url: string, changeIndicator: boolean) {
    super(name, icon);
    this.url = url;
    this.changeIndicator = changeIndicator;
  }
}

export class PublishedContentsState {
  groupName: string;
  firstContentPublished: number;
  lastContentPublished: number;

  constructor(groupName: string, firstContentPublished: number, lastContentPublished: number) {
    this.groupName = groupName;
    this.firstContentPublished = firstContentPublished;
    this.lastContentPublished = lastContentPublished;
  }

}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent extends BarBaseComponent implements OnInit, OnDestroy {

  barItems: NavBarItem[] = [];
  features: BarItem[] = [
    new BarItem(Features.COMMENTS, 'question_answer'),
    new BarItem(Features.CONTENTS, 'equalizer'),
    new BarItem(Features.FEEDBACK, 'thumbs_up_down')
  ];
  currentRouteIndex: number;
  isActive = true;
  activeFeatures: string[] = [Features.COMMENTS];
  tooFewFeatures = false;
  group: ContentGroup;
  groupName: string;
  role: UserRole;
  shortId: string;
  roomId: string;
  changesSubscription: Subscription;
  statsChangesSubscription: Subscription;
  groupSubscriptions: Subscription[];
  feedbackSubscription: Subscription;
  contentGroups: ContentGroup[] = [];
  publishedStates: PublishedContentsState[] = [];
  hideBarForParticipants;
  focusStateSubscription: Subscription;
  guidedModeExtensionData: object;
  isLoading = true;

  constructor(protected router: Router,
              protected routingService: RoutingService,
              protected route: ActivatedRoute,
              protected globalStorageService: GlobalStorageService,
              protected roomStatsService: RoomStatsService,
              protected feedbackService: FeedbackService,
              protected contentGroupService: ContentGroupService,
              protected eventService: EventService) {
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
      for (let subscription of this.groupSubscriptions) {
        subscription.unsubscribe();
      }
    }
    if (this.feedbackSubscription) {
      this.feedbackSubscription.unsubscribe();
    }
    if (this.focusStateSubscription) {
      this.focusStateSubscription.unsubscribe();
    }
  }

  beforeInit() {
    this.subscribeToFocusModeEvent();
  }

  subscribeToFocusModeEvent() {
    this.focusStateSubscription = this.eventService.on<boolean>(RemoteMessage.FOCUS_STATE_CHANGED).subscribe(guided => {
      this.hideBarForParticipants = guided && this.role === UserRole.PARTICIPANT;
      this.sendVisibleStatusEvent();
    });
  }

  afterInit() {
    const featureUrl = this.activeFeatures[this.currentRouteIndex] !== Features.CONTENTS ? this.activeFeatures[this.currentRouteIndex] : this.groupName;
    this.guidedModeExtensionData = {featureUrl: [featureUrl], roomId: this.roomId};
    this.isLoading = false;
  }

  initItems() {
    this.beforeInit();
    this.route.data.subscribe(data => {
      this.role = data.viewRole;
      this.shortId = data.room.shortId;
      this.roomId = data.room.id;
      if (!data.room.settings['feedbackLocked'] || this.role !== UserRole.PARTICIPANT) {
        this.activeFeatures.push(Features.FEEDBACK);
      }
      this.feedbackService.startSub(this.roomId);
      let group = this.routingService.seriesName;
      if (group === undefined) {
        group = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
      } else {
        this.setGroupInSessionStorage(group);
      }
      this.roomStatsService.getStats(this.roomId, this.role !== UserRole.PARTICIPANT).subscribe(stats => {
        if (stats.groupStats) {
          this.groupName = group || stats.groupStats[0].groupName;
          this.setGroupInSessionStorage(this.groupName);
          this.activeFeatures.splice(1, 0, Features.CONTENTS);
        }
        this.getItems();
        this.updateGroups(stats.groupStats ?? [], !!group);
      });
      this.subscribeToFeedbackEvent();
      this.subscribeToRouteChanges();
      if (this.role === UserRole.PARTICIPANT) {
        this.subscribeToContentGroups();
        this.subscribeToRemoteEvent();
      }
    });
  }

  subscribeToRemoteEvent() {
    this.eventService.on<string>(RemoteMessage.CHANGE_FEATURE_ROUTE).subscribe(feature => {
      const featureIndex = this.barItems.map(b => b.name).indexOf(feature);
      this.navToUrl(featureIndex);
    });
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }

  removeGroupInSessionStorage() {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
  }

  subscribeToFeedbackEvent() {
    if (this.role === UserRole.PARTICIPANT) {
      this.feedbackSubscription = this.feedbackService.messageEvent.subscribe(message => {
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
      });
    }
  }

  subscribeToRouteChanges() {
    this.routingService.getRouteChanges().subscribe(route => {
      const newGroup = route.params['seriesName'];
      if (newGroup && newGroup !== this.groupName) {
        this.updateGroupName(newGroup);
      }
      this.getCurrentRouteIndex();
      if (this.currentRouteIndex > -1) {
        this.disableNewsForCurrentRoute();
      }
      setTimeout(() => {
        this.sendVisibleStatusEvent();
      }, 0);
    });
  }

  getItems() {
    for (const feature of this.features) {
      let url = this.getBaseUrl() + this.getFeatureUrl(feature.name);
      const index = this.activeFeatures.indexOf(feature.name);
      const isVisible = this.barItems.map(b => b.name).includes(feature.name)
      if (index > -1) {
        if (!isVisible) {
          this.barItems.push(
            new NavBarItem(
              feature.name,
              feature.icon,
              url,
              false
            )
          );
        }
      } else {
        if (isVisible) {
          this.barItems.splice(index, 1);
        }
      }
    }
    if (this.barItems.length > 1) {
      this.getCurrentRouteIndex();
      setTimeout(() => {
        this.toggleVisibility(false);
      }, 500);
      this.tooFewFeatures = false;
    } else {
      this.tooFewFeatures = true;
    }
    this.sendVisibleStatusEvent();
  }

  sendVisibleStatusEvent() {
    this.eventService.broadcast(UiState.NAV_BAR_VISIBLE, !this.tooFewFeatures && !this.hideBarForParticipants);
  }

  getCurrentRouteIndex() {
    const matchingRoutes = this.barItems.filter(b => this.isRouteMatching(b.url));
    if (matchingRoutes.length > 0) {
      this.currentRouteIndex = this.barItems.map(s => s.url).indexOf(matchingRoutes[matchingRoutes.length - 1].url);
    } else {
      this.currentRouteIndex = -1;
    }
  }

  isRouteMatching(url): boolean {
    const urlTree = this.router.createUrlTree([url]);
    return this.router.url.includes(this.router.serializeUrl(urlTree))
  }

  getFeatureUrl(feature: string): string {
    let url = feature;
    if (this.groupName && feature === Features.CONTENTS) {
      url += this.getGroupUrl();
    }
    return url;
  }

  getBaseUrl(): string {
    return `/${this.routingService.getRoleString(this.role)}/${this.shortId}/`;
  }

  getGroupUrl() {
    return '/' + this.groupName;
  }

  navToUrl(index: number) {
    const item = this.barItems[index];
    const url = item.url;
    if (url) {
      if (item.name === Features.CONTENTS) {
        const route = [this.routingService.getRoleString(this.role), this.shortId, 'series', this.groupName];
        if (this.role === UserRole.CREATOR) {
          route.push('1');
        }
        this.router.navigate(route);
      } else {
        this.router.navigateByUrl(url);
      }
    }
  }

  disableNewsForCurrentRoute() {
    this.barItems[this.currentRouteIndex].changeIndicator = false;
  }

  toggleVisibility(active: boolean) {
    const timeout = active ? 0 : 500;
    setTimeout(() => {
      this.isActive = active;
    }, timeout);
  }

  updateGroups(groupStats: ContentGroupStatistics[], alreadySet: boolean) {
    if (this.contentGroups.length > 0) {
      if (this.listObjectIdsEquals(this.contentGroups, groupStats)) {
        return;
      }
      this.resetGroups();
    }
    const groupCount = groupStats.length;
    if (groupCount > 0) {
      this.groupSubscriptions = [];
      for (let i = 0; i < groupCount; i++) {
        this.groupSubscriptions[i] = this.contentGroupService.getById(groupStats[i].id, { roomId: this.roomId }).subscribe(group => {
          this.contentGroups.push(group);
          this.publishedStates.push(
            new PublishedContentsState(group.name, group.firstPublishedIndex, group.lastPublishedIndex)
          );
          if (this.contentGroups.length === groupCount) {
            if (alreadySet) {
              if (this.groupName === group.name) {
                this.group = group;
                this.setGroupProperties();
              }
              this.afterInit();
            } else {
              this.afterInit();
              if (groupCount > 1) {
                this.setGroup();
              }
            }
          }
        });
      }
    } else {
      this.afterInit();
    }
  }

  resetGroups() {
    this.contentGroups.splice(0, this.contentGroups.length);
    this.groupSubscriptions.forEach(s => s.unsubscribe());
    this.groupSubscriptions = [];
  }

  subscribeToContentGroups() {
    this.changesSubscription = this.eventService.on('EntityChanged').subscribe(changes => {
      this.handleContentGroupChanges(changes);
    });
    const changeEventType = this.role === UserRole.PARTICIPANT ? 'PublicDataChanged' : 'ModeratorDataChanged';
    this.statsChangesSubscription = this.eventService.on<DataChanged<RoomStats>>(changeEventType)
        .subscribe(event => this.updateGroups(event.payload.data.groupStats, true));
  }

  setGroup(group?: ContentGroup) {
    this.group = group || this.getFirstGroupWithPublishedContents();
    this.setGroupProperties();
    this.updateGroupName(this.groupName);
  }

  getFirstGroupWithPublishedContents(): ContentGroup {
    return this.contentGroups.filter(cg => !this.noContentsPublished(cg.firstPublishedIndex, cg.lastPublishedIndex))[0]
      || this.contentGroups[0];
  }

  filterPublishedGroups(): boolean {
    this.contentGroups = this.contentGroups.filter(cg => cg.published);
    if (this.contentGroups.length === 0) {
      const index = this.activeFeatures.indexOf(Features.CONTENTS);
      if (index !== this.currentRouteIndex) {
        this.activeFeatures.splice(index, 1);
        this.toggleNews(Features.CONTENTS);
        this.getItems();
      }
      this.removeGroupInSessionStorage();
      return false;
    } else {
      return true;
    }
  }

  setGroupProperties() {
    this.groupName = this.group.name;
    this.setPublishedState(this.group.firstPublishedIndex, this.group.lastPublishedIndex);
  }

  setPublishedState(first: number, last: number) {
    const currentPublished = this.getCurrentPublishedState();
    currentPublished.firstContentPublished = first;
    currentPublished.lastContentPublished = last;
  }

  getBarIndexOfFeature(name: string): number {
    return this.barItems.map(b => b.name).indexOf(name);
  }

  updateGroupName(name: string) {
    this.groupName = name;
    const groupBarIndex = this.getBarIndexOfFeature(Features.CONTENTS);
    if (this.barItems[groupBarIndex]) {
      this.barItems[groupBarIndex].url = `${this.getBaseUrl()}/${Features.CONTENTS}/${this.groupName}`;
    }
    this.setGroupInSessionStorage(this.groupName);
  }

  isAlreadyPublished(first: number, last: number) {
    const currentPublished = this.getCurrentPublishedState();
    const currentFirst = currentPublished.firstContentPublished;
    const currentLast = currentPublished.lastContentPublished;
    const rangeInRange = currentFirst <= first && currentLast >= last;
    const singleInRange = first === last && first <= currentLast && first >= currentFirst;
    return rangeInRange || singleInRange;
  }

  getCurrentPublishedState(): PublishedContentsState {
    return this.publishedStates.filter(p => p.groupName === this.groupName)[0];
  }

  noContentsPublished(first: number, last: number) {
    return first === -1 && last === -1;
  }

  checkContentPublishing(first: number, last: number, setNewState: boolean) {
    const currentPublished = this.getCurrentPublishedState();
    if (this.noContentsPublished(currentPublished.firstContentPublished, currentPublished.lastContentPublished)
      || (!this.noContentsPublished(first, last)
      && !this.isAlreadyPublished(first, last))) {
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
      if (this.groupName !== changes.entity.name) {
        if (changes.entity.published && !this.noContentsPublished(changes.entity.firstPublishedIndex, changes.entity.lastPublishedIndex)) {
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
    const changedEvent = new EntityChanged('ContentGroup', changes.entity, changes.changedProperties);
    if (changedEvent.hasPropertyChanged('firstPublishedIndex') || changedEvent.hasPropertyChanged('lastPublishedIndex')) {
      this.checkContentPublishing(changedEvent.payload.entity.firstPublishedIndex, changedEvent.payload.entity.lastPublishedIndex, true);
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
        if (this.getBarIndexOfFeature(Features.CONTENTS) === -1) {
          this.activeFeatures.splice(1, 0, Features.CONTENTS);
          this.getItems();
        }
        this.toggleNews(Features.CONTENTS);
      }
    }
  }

  private listObjectIdsEquals(obj1: {id: string}[], obj2: {id: string}[]) {
    return JSON.stringify(obj1.map(cg => cg.id)) === JSON.stringify(obj2.map(cg => cg.id));
  }
}
