import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { BarBaseComponent, BarItem } from '../bar-base';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { UserRole } from '../../../../models/user-roles.enum';
import { RoomService } from '../../../../services/http/room.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { FeedbackMessageType } from '../../../../models/messages/feedback-message-type';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentGroup } from '../../../../models/content-group';
import { EventService } from '../../../../services/util/event.service';
import { Subscription } from 'rxjs';
import { EntityChanged } from '../../../../models/events/entity-changed';
import { ContentGroupStatistics } from '../../../../models/content-group-statistics';

export class NavBarItem extends BarItem {

  url: string;
  changeIndicator: boolean;

  constructor(name: string, icon: string, url: string, changeIndicator: boolean) {
    super(name, icon);
    this.url = url;
    this.changeIndicator = changeIndicator;
  }
}

export class ChangeIndicator {
  featureName: string;
  changes: boolean;

  constructor(featureName: string, changes: boolean) {
    this.featureName = featureName;
    this.changes = changes;
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

export enum FEATURES {
  COMMENTS = 'comments',
  GROUP = 'group',
  SURVEY = 'survey',
  MODERATION = 'moderation'
}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent extends BarBaseComponent implements OnInit, OnDestroy {

  @Output() isVisible = new EventEmitter<boolean>();

  barItems: NavBarItem[] = [];
  features: BarItem[] = [
    new BarItem(FEATURES.COMMENTS, 'question_answer'),
    new BarItem(FEATURES.GROUP, 'equalizer'),
    new BarItem(FEATURES.SURVEY, 'thumbs_up_down'),
    new BarItem(FEATURES.MODERATION, 'gavel')
  ];
  currentRouteIndex: number;
  isActive = true;
  activeFeatures: string[] = [FEATURES.COMMENTS];
  tooFewFeatures = false;
  group: ContentGroup;
  groupName: string;
  role: UserRole;
  shortId: string;
  roomId: string;
  changesSubscription: Subscription;
  groupSubscriptions: Subscription[];
  feedbackSubscription: Subscription;
  changeIndicator: ChangeIndicator[];
  contentGroups: ContentGroup[] = [];
  publishedStates: PublishedContentsState[] = [];

  constructor(private router: Router,
              private routingService: RoutingService,
              private route: ActivatedRoute,
              private globalStorageService: GlobalStorageService,
              private roomService: RoomService,
              private feedbackService: FeedbackService,
              private contentGroupService: ContentGroupService,
              private eventService: EventService) {
    super();
  }

  ngOnDestroy(): void {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.groupSubscriptions) {
      for (let subscription of this.groupSubscriptions) {
        subscription.unsubscribe();
      }
    }
    if (this.feedbackSubscription) {
      this.feedbackSubscription.unsubscribe();
    }
  }

  initItems() {
    this.changeIndicator = this.globalStorageService.getItem(STORAGE_KEYS.FEATURE_NEWS);
    this.route.data.subscribe(data => {
      if (!data.room.settings['feedbackLocked']) {
        this.activeFeatures.push(FEATURES.SURVEY);
      }
      this.role = data.viewRole;
      this.shortId = data.room.shortId;
      this.roomId = data.room.id;
      this.feedbackService.startSub(data.room.id);
      this.route.params.subscribe(params => {
        let group = params['contentGroup'];
        if (group === undefined) {
          group = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
        } else {
          this.setGroupInSessionStorage(group);
        }
        // Checking if storage item is initialized yet
        if (group === undefined) {
          this.roomService.getStats(data.room.id).subscribe(stats => {
            if (stats.groupStats) {
              this.groupName = stats.groupStats[0].groupName;
              this.setGroupInSessionStorage(this.groupName);
              this.activeFeatures.splice(1, 0, FEATURES.GROUP);
            } else {
              // Initialize storage item with empty string if there are no groups yet
              this.setGroupInSessionStorage('');
            }
            this.getItems();
            this.subscribeToContentGroups(stats.groupStats, false);
          });
        } else {
          // Checking if storage item is initialized with data
          if (group !== '') {
            this.groupName = group;
            this.activeFeatures.splice(1, 0, FEATURES.GROUP);
          }
          this.getItems();
          this.roomService.getStats(data.room.id).subscribe(stats => {
            this.subscribeToContentGroups(stats.groupStats, true);
          });
        }
      })
    });
    this.checkForFeedback();
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }

  removeGroupInSessionStorage() {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
  }

  checkForFeedback() {
    this.feedbackSubscription = this.feedbackService.messageEvent.subscribe(message => {
      const type = JSON.parse(message.body).type;
      if (type === FeedbackMessageType.STARTED) {
        this.activeFeatures.push(FEATURES.SURVEY);
        this.changeIndicator.push(
          new ChangeIndicator(FEATURES.SURVEY, true)
        );
        this.getItems();
        this.toggleNews(FEATURES.SURVEY);
      } else if (type === FeedbackMessageType.STOPPED) {
        const index = this.activeFeatures.indexOf(FEATURES.SURVEY);
        if (this.currentRouteIndex !== index) {
          this.activeFeatures.splice(index, 1);
          this.changeIndicator.splice(index, 1);
          this.getItems();
        }
      }
    });
  }

  getItems() {
    this.barItems = [];
    const changeIndicator: ChangeIndicator[] = [];
    for (const feature of this.features) {
      let url = this.getBaseUrl();
      if (feature.name !== FEATURES.MODERATION) {
        url += feature.name;
        if (this.groupName && feature.name === FEATURES.GROUP) {
          url += this.getQuestionUrl(this.role, this.groupName);
        }
      } else {
        url += 'moderator/comments';
      }
      const featureIndex = this.activeFeatures.indexOf(feature.name);
      if ((featureIndex > -1 || (feature.name === FEATURES.SURVEY && this.role === UserRole.CREATOR))
          && this.role !== UserRole.EXECUTIVE_MODERATOR || (this.role === UserRole.EXECUTIVE_MODERATOR
          && (feature.name === FEATURES.MODERATION || feature.name === FEATURES.COMMENTS))) {
        this.barItems.push(
          new NavBarItem(
            feature.name,
            feature.icon,
            url,
            false));
        if (!this.changeIndicator) {
          changeIndicator.push(
            new ChangeIndicator(
              feature.name,
              false
            )
          )
        } else if (this.changeIndicator.map(c => c.featureName).indexOf(feature.name) === -1) {
          this.changeIndicator.splice(featureIndex, 0, new ChangeIndicator(feature.name,false));
        }
      }
    }
    if (!this.changeIndicator) {
      this.changeIndicator = changeIndicator;
    }
    if (this.barItems.length > 1) {
      const matchingRoutes = this.barItems.filter(s => this.router.url.includes(s.name !== FEATURES.GROUP ? s.url : '/group/'));
      if (matchingRoutes.length > 0) {
        this.currentRouteIndex = this.barItems.map(s => s.url).indexOf(matchingRoutes[0].url);
      }
      this.changeIndicator.map((n, index) => n.changes = n.changes && index !== this.currentRouteIndex);
      this.updateNews();
      setTimeout(() => {
        this.toggleVisibility(false);
      }, 500);
      this.tooFewFeatures = false;
    } else {
      this.tooFewFeatures = true;
    }
    this.isVisible.emit(!this.tooFewFeatures);
  }

  updateNews() {
    this.globalStorageService.setItem(STORAGE_KEYS.FEATURE_NEWS, this.changeIndicator);
    this.updateItemNews();
  }

  updateItemNews() {
    this.barItems.map((b, index) => b.changeIndicator = this.changeIndicator[index].changes);
  }

  getBaseUrl(): string {
    return `/${this.routingService.getRoleString(this.role)}/room/${this.shortId}/`;
  }

  getQuestionUrl(role: UserRole, group: string): string {
    let url =  '/' + group;
    if (role === UserRole.CREATOR) {
      url += '/statistics';
    }
    return url;
  }

  navToUrl(index: number) {
    const item = this.barItems[index];
    const url = item.url;
    if (url) {
      if (item.name === FEATURES.GROUP) {
        const route = [this.routingService.getRoleString(this.role), 'room', this.shortId, 'group', this.groupName];
        if (this.role === UserRole.CREATOR) {
          route.push('statistics');
        }
        this.router.navigate(route);
      } else {
        this.router.navigateByUrl(url);
      }
    }
  }

  toggleVisibility(active: boolean) {
    const timeout = active ? 0 : 500;
    setTimeout(() => {
      this.isActive = active;
    }, timeout);
  }

  subscribeToContentGroups(groupStats: ContentGroupStatistics[], alreadySet: boolean) {
    if (groupStats) {
      const groupCount = groupStats.length;
      this.groupSubscriptions = [];
      for (let i = 0; i < groupCount; i++) {
        this.groupSubscriptions[i] = this.contentGroupService.getById(groupStats[i].id, { roomId: this.roomId }).subscribe(group => {
          this.contentGroups.push(group);
          this.publishedStates.push(
            new PublishedContentsState(group.name, group.firstPublishedIndex, group.lastPublishedIndex)
          );
          if (alreadySet) {
            if (this.groupName === group.name) {
              this.group = group;
              this.setGroupProperties();
            }
          }
          if (this.contentGroups.length === groupCount && !alreadySet) {
            if (groupCount > 1) {
              this.setGroup();
            }
          }
        });
      }
      this.changesSubscription = this.eventService.on('EntityChanged').subscribe(changes => {
        this.handleContentGroupChanges(changes);
      });
    }
  }

  setGroup() {
    this.group = this.getFirstGroupWithPublishedContents();
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
      const index = this.activeFeatures.indexOf(FEATURES.GROUP);
      if (index !== this.currentRouteIndex) {
        this.activeFeatures.splice(index, 1);
        this.changeIndicator.splice(index, 1);
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
    const groupBarIndex = this.getBarIndexOfFeature(FEATURES.GROUP);
    this.barItems[groupBarIndex].url = `${this.getBaseUrl()}/${FEATURES.GROUP}/${this.getQuestionUrl(this.role, this.groupName)}`;
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
      this.toggleNews(FEATURES.GROUP);
    }
    if (setNewState) {
      this.setPublishedState(first, last);
    }
  }

  toggleNews(feature: string) {
    const featureIndex = this.getBarIndexOfFeature(feature);
    if (featureIndex !== this.currentRouteIndex) {
      this.changeIndicator[featureIndex].changes = true;
      this.updateNews();
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
        if (this.getBarIndexOfFeature(FEATURES.GROUP) === -1) {
          this.activeFeatures.splice(1, 0, FEATURES.GROUP);
          this.getItems();
        }
        this.toggleNews(FEATURES.GROUP);
      }
    }
  }
}
