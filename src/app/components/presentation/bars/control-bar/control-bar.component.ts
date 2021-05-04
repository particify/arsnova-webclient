import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FEATURES, NavBarComponent, NavBarItem } from '../../../shared/bars/nav-bar/nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { RoomService } from '../../../../services/http/room.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { EventService } from '../../../../services/util/event.service';
import { BarItem } from '../../../shared/bars/bar-base';
import { UserRole } from '../../../../models/user-roles.enum';
import { KEYBOARD_KEYS, KeyboardKey } from '../../../../utils/keyboard/keys';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { ContentGroup } from '../../../../models/content-group';

export class KeyNavBarItem extends NavBarItem {
  key: string;

  constructor(name: string, icon: string, url: string, key: string) {
    super(name, icon, url, false);
    this.key = key;
  }
}

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss']
})
export class ControlBarComponent extends NavBarComponent implements OnInit {

  @Input() shortId: string;
  @Output() activeFeature: EventEmitter<string> = new EventEmitter<string>();
  @Output() activeGroup: EventEmitter<string> = new EventEmitter<string>();

  inFullscreen = false;
  barItems: KeyNavBarItem[] = [];
  surveyStarted = false;
  menuOpen = false;

  features: BarItem[] = [
    new BarItem(FEATURES.COMMENTS, 'question_answer'),
    new BarItem(FEATURES.GROUP, 'equalizer'),
    new BarItem(FEATURES.SURVEY, 'thumbs_up_down')
  ];
  groupActionItems: KeyNavBarItem[] = [
    new KeyNavBarItem('results', 'insert_chart', '', 'SPACE'),
    new KeyNavBarItem('correct', 'check_circle', '', 'LetterC'),
    new KeyNavBarItem('lock', 'lock', '', 'LetterL'),
  ];
  surveyActionItems: KeyNavBarItem[] = [
    new KeyNavBarItem('start', 'play_arrow', '', 'SPACE'),
    new KeyNavBarItem('change-type', 'swap_horiz', '', 'LetterC')
  ];
  arrowActionItems: KeyNavBarItem[] = [
    new KeyNavBarItem('left', 'arrow_back', '', 'LEFT'),
    new KeyNavBarItem('right', 'arrow_forward', '', 'RIGHT'),
  ];
  generalActionItems: KeyNavBarItem[] = [
    new KeyNavBarItem('share', 'qr_code', '', 'LetterQ'),
    new KeyNavBarItem('fullscreen', 'open_in_full', '', 'LetterF'),
    new KeyNavBarItem('exit', 'close', '', 'Escape'),
  ];

  constructor(
    protected router: Router,
    protected routingService: RoutingService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected roomService: RoomService,
    protected feedbackService: FeedbackService,
    protected contentGroupService: ContentGroupService,
    protected eventService: EventService
  ) {
    super(router, routingService, route, globalStorageService,
      roomService, feedbackService, contentGroupService, eventService);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
      this.updateFeature(FEATURES.COMMENTS);
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
      this.updateFeature(FEATURES.GROUP);
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
      this.updateFeature(FEATURES.SURVEY);
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LetterQ) === true) {
      this.updateFeature(undefined);
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LetterF) === true) {
      this.toggleFullscreen();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.exitPresentation();
    }
  }

  isActiveFeature(feature: string): boolean {
    return this.barItems.map(b => b.name).indexOf(feature) === this.currentRouteIndex;
  }

  beforeInit() {
    this.subscribeFullscreen();
  }

  afterInit() {
    this.route.data.subscribe(data => {
      this.surveyStarted = !data.room.settings.feedbackLocked;
      this.surveyActionItems[0].name = this.surveyStarted ? 'stop' : 'start';
      this.surveyActionItems[0].icon = this.surveyStarted ? 'stop' : 'play_arrow';
    });
    this.barItems.map(b => b.key = this.getFeatureKey(b.name));
  }

  getFeatureKey(name: string): string {
    return (this.features.map(f => f.name).indexOf(name) + 1).toString();
  }

  updateFeature(feature: string) {
    this.activeFeature.emit(feature);
    if (feature) {
      this.getCurrentRouteIndex(feature);
    } else {
      this.currentRouteIndex = undefined;
    }
  }

  getCurrentRouteIndex(feature?: string) {
    let index;
    if (feature) {
      index = this.barItems.map(s => s.name).indexOf(feature);
    } else {
      const matchingRoutes = this.barItems.filter(s => this.isRouteMatching(s.url));
      if (matchingRoutes.length > 0) {
        index = this.barItems.map(s => s.url).indexOf(matchingRoutes[0].url);
      }
    }
    this.currentRouteIndex = index;
  }

  subscribeFullscreen() {
    document.addEventListener('fullscreenchange', () => {
      this.inFullscreen = !!document.fullscreenElement;
    });
  }

  getBaseUrl(): string {
    return `/presentation/${this.shortId}/`;
  }

  getFeatureUrl(feature: string): string {
    return this.groupName && feature === FEATURES.GROUP ? this.getQuestionUrl(this.role, this.groupName) : feature;
  }

  getQuestionUrl(role: UserRole, group: string): string {
    return group;
  }

  navToUrl(index: number) {
    const item = this.barItems[index];
    const url = item.url;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  toggleFullscreen() {
    if (this.inFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  exitPresentation() {
    this.router.navigateByUrl(`creator/room/${this.shortId}`);
  }

  sendKeyEvent(key: string) {
    const event = new KeyboardEvent('keyup', {
      key: KEYBOARD_KEYS.get(KeyboardKey[key]).key[0],
    });
    window.dispatchEvent(event);
  }

  changeGroup(contentGroup: ContentGroup) {
    this.setGroup(contentGroup);
    this.activeGroup.emit(this.groupName);
  }
}
