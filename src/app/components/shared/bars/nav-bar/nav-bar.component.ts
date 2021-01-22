import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BarBaseComponent, BarItem } from '../bar-base';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { UserRole } from '../../../../models/user-roles.enum';
import { RoomService } from '../../../../services/http/room.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { FeedbackMessageType } from '../../../../models/messages/feedback-message-type';

export class NavBarItem extends BarItem {

  url: string;
  news: boolean;

  constructor(name: string, icon: string, url: string, news: boolean) {
    super(name, icon);
    this.url = url;
    this.news = news;
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
export class NavBarComponent extends BarBaseComponent implements OnInit {

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
  group: string;
  role: UserRole;
  shortId: string;

  constructor(private router: Router,
              private routingService: RoutingService,
              private route: ActivatedRoute,
              private globalStorageService: GlobalStorageService,
              private roomService: RoomService,
              private feedbackService: FeedbackService) {
    super();
  }

  initItems() {
    this.route.data.subscribe(data => {
      if (!data.room.settings['feedbackLocked']) {
        this.activeFeatures.push(FEATURES.SURVEY);
      }
      this.role = data.viewRole;
      this.shortId = data.room.shortId;
      this.feedbackService.startSub(data.room.id);
      const group = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
      // Checking if storage item is initialized yet
      if (group === undefined) {
        this.roomService.getStats(data.room.id).subscribe(stats => {
          if (stats.groupStats) {
            this.group = stats.groupStats[0].groupName;
            this.setGroupInSessionStorage(this.group);
            this.activeFeatures.push(FEATURES.GROUP);
          } else {
            // Initialize storage item with empty string if there are no groups yet
            this.setGroupInSessionStorage('');
          }
          this.getItems();
        });
      } else {
        // Checking if storage item is initialized with data
        if (group !== '') {
          this.group = group;
          this.activeFeatures.push(FEATURES.GROUP);
        }
        this.getItems();
      }
    });
    this.checkForFeedback();
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }

  checkForFeedback() {
    this.feedbackService.messageEvent.subscribe(message => {
      const type = JSON.parse(message.body).type;
      if (type === FeedbackMessageType.STARTED) {
        this.activeFeatures.push(FEATURES.SURVEY);
        this.getItems();
      } else if (type === FeedbackMessageType.STOPPED) {
        const index = this.activeFeatures.indexOf(FEATURES.SURVEY);
        if (this.currentRouteIndex !== index) {
          this.activeFeatures.splice(index, 1);
          this.getItems();
        }
      }
    });
  }

  getItems() {
    this.barItems = [];
    for (const feature of this.features) {
      let url = `/${this.routingService.getRoleString(this.role)}/room/${this.shortId}/`;
      if (feature.name !== FEATURES.MODERATION) {
        url += feature.name;
        if (this.group && feature.name === FEATURES.GROUP) {
          url += this.getQuestionUrl(this.role, this.group);
        }
      } else {
        url += 'moderator/comments';
      }
      if ((this.activeFeatures.indexOf(feature.name) > -1 || (feature.name === FEATURES.SURVEY && this.role === UserRole.CREATOR))
          && this.role !== UserRole.EXECUTIVE_MODERATOR || (this.role === UserRole.EXECUTIVE_MODERATOR
          && (feature.name === FEATURES.MODERATION || feature.name === FEATURES.COMMENTS))) {
        this.barItems.push(
          new NavBarItem(
            feature.name,
            feature.icon,
            url,
            false));
      }
    }
    if (this.barItems.length > 1) {
      const matchingRoutes = this.barItems.filter(s => this.router.url.includes(s.url));
      if (matchingRoutes.length > 0) {
        this.currentRouteIndex = this.barItems.map(s => s.url).indexOf(matchingRoutes[0].url);
      }
      setTimeout(() => {
        this.toggleVisibility(false);
      }, 500);
      this.tooFewFeatures = false;
    } else {
      this.tooFewFeatures = true;
    }
    this.isVisible.emit(!this.tooFewFeatures);
  }

  getQuestionUrl(role: UserRole, group: string): string {
    let url =  '/' + group;
    if (role === UserRole.CREATOR) {
      url += '/statistics';
    }
    return url;
  }

  navToUrl(index: number) {
    const url = this.barItems[index].url;
    if (url) {
      this.router.navigate([url]);
    }
  }

  toggleVisibility(active: boolean) {
    const timeout = active ? 0 : 500;
    setTimeout(() => {
      this.isActive = active;
    }, timeout);
  }
}
