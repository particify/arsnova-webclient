import { AfterContentInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';
import { TranslateService } from '@ngx-translate/core';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { Location } from '@angular/common';
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Answer } from '../../../models/answer';
import { RoutingService } from '../../../services/util/routing.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { EventService } from '../../../services/util/event.service';
import { EntityChanged } from '../../../models/events/entity-changed';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  styleUrls: ['./participant-content-carousel-page.component.scss']
})
export class ParticipantContentCarouselPageComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild(StepperComponent) stepper: StepperComponent;

  ContentType: typeof ContentType = ContentType;

  contents: Content[] = [];
  contentGroup: ContentGroup;
  contentGroupName: string;
  shortId: string;
  isLoading = true;
  alreadySent = new Map<number, boolean>();
  status = {
    LAST_CONTENT: 'LAST_CONTENT',
    FIRST_UNANSWERED: 'FIRST_UNANSWERED',
    NORMAL: 'NORMAL',
    PRE_START: 'PRE_START'
  };
  started: string;
  answers: Answer[];
  currentStep = 0;
  isReloading = false;
  displaySnackBar = false;
  changesSubscription: Subscription;

  constructor(
    private contentService: ContentService,
    protected translateService: TranslateService,
    protected roomService: RoomService,
    private contentgroupService: ContentGroupService,
    protected route: ActivatedRoute,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private answerService: ContentAnswerService,
    private authenticationService: AuthenticationService,
    private routingService: RoutingService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private router: Router
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
      document.getElementById('step').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announce('answer.a11y-shortcuts');
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }


  ngOnDestroy(): void {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    const lastContentIndex = this.route.snapshot.params['contentIndex'] - 1;
    this.contentGroupName = this.route.snapshot.params['contentGroup'];
    this.route.data.subscribe(data => {
      this.shortId = data.room.shortId;
      this.contentgroupService.getByRoomIdAndName(data.room.id, this.contentGroupName).subscribe(contentGroup => {
        this.contentGroup = contentGroup;
        this.getContents(lastContentIndex);
      },
        error => {
        this.finishLoading()
        });
    });
    this.changesSubscription = this.eventService.on('EntityChanged').subscribe(changes => {
      this.handleStateEvent(changes);
    });
  }

  getContents(lastContentIndex) {
    this.contents = [];
    const publishedIds = this.contentgroupService.filterPublishedIds(this.contentGroup);
    if (publishedIds.length > 0 && this.contentGroup.published) {
      this.contentService.getContentsByIds(this.contentGroup.roomId, publishedIds).subscribe(contents => {
        this.contents = this.contentService.getSupportedContents(contents);
        this.getAnswers(lastContentIndex);
      });
    } else {
      this.finishLoading();
    }
  }

  finishLoading() {
    this.isLoading = false;
    this.isReloading = false;
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentIndex: number) {
    if (contentIndex >= 0) {
      this.initStepper(contentIndex);
    } else {
      this.getFirstUnansweredContent();
    }
  }

  initStepper(index: number) {
    setTimeout(() => {
      this.currentStep = index;
      this.stepper.init(index, this.contents.length);
    }, 200);
    this.started = this.status.NORMAL;
  }

  updateURL(index?: number) {
    this.currentStep = index || 0;
    const indexExtension = index ? '/' + (index + 1) : '';
    const urlTree = this.router.createUrlTree(['participant/room', this.shortId, 'group', this.contentGroupName, indexExtension]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  getFirstUnansweredContent() {
    let isInitialized = false;
    for (let i = 0; i < this.alreadySent.size; i++) {
      if (this.alreadySent.get(i) === false) {
        this.initStepper(i);
        isInitialized = true;
        break;
      }
    }
    if (!isInitialized) {
      this.initStepper(0);
    }
  }

  nextContent(finish?: boolean) {
    if (!finish) {
      this.stepper.next();
    } else {
      this.stepper.headerPos = 0;
      this.stepper.onClick(0);
    }
  }

  receiveSentStatus(answer: Answer, index: number) {
    this.alreadySent.set(index, !!answer);
    this.answers[this.contents.map(c => c.id).indexOf(answer.contentId)] = answer;
    if (this.started === this.status.NORMAL) {
      if (index < this.contents.length - 1) {
        let wait = 400;
        if (this.contents[index].state.answersPublished) {
          wait += 600;
        }
        setTimeout(() => {
          this.nextContent();
          setTimeout(() => {
            document.getElementById('step').focus();
          }, 200);
        }, wait);
      } else {
        this.announce('answer.a11y-last-content');
      }
    }
  }

  getAnswers(lastContentIndex: number) {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      this.answerService.getAnswersByUserIdContentIds(this.contentGroup.roomId, auth.userId, this.contents
        .map(c => c.id)).subscribe(answers => {
          let answersAdded = 0;
          this.answers = [];
          for (const [index, content] of this.contents.entries()) {
            if (answersAdded < answers.length) {
              for (const answer of answers) {
                if (content.id === answer.contentId) {
                  this.answers[index] = answer;
                  answersAdded++;
                }
              }
            }
            this.alreadySent.set(index, !!this.answers[index]);
          }
          this.finishLoading();
          this.checkIfLastContentExists(lastContentIndex);
        },
        error => {
          this.finishLoading();
          const msg = this.translateService.instant('answer.group-not-available');
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
    });
  }

  handleStateEvent(changes) {
    if (changes.entity.id === this.contentGroup.id) {
      this.contentGroup = changes.entity;
      const changedEvent = new EntityChanged('ContentGroup', changes.entity, changes.changedProperties);
      if (changedEvent.hasPropertyChanged('firstPublishedIndex') || changedEvent.hasPropertyChanged('lastPublishedIndex')
        || changedEvent.hasPropertyChanged('published')) {
        if (!this.displaySnackBar) {
          this.displaySnackBar = true;
          const contentsChangedMessage = this.translateService.instant('answer.state-changed');
          const loadString = this.translateService.instant('answer.load');
          this.notificationService.show(contentsChangedMessage, loadString, { duration: 5000 });
          this.notificationService.snackRef.onAction().subscribe(() => {
            this.displaySnackBar = false;
            this.updateURL();
            this.isReloading = true;
            this.getContents(this.currentStep);
          });
          this.notificationService.snackRef.afterDismissed().subscribe(() => {
            this.displaySnackBar = false;
          })
        }
      }
    }
  }
}
