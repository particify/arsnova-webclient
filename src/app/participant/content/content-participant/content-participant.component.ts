import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { Answer } from '@app/core/models/answer';
import { Content } from '@app/core/models/content';
import { ContentChoice } from '@app/core/models/content-choice';
import { TextAnswer } from '@app/core/models/text-answer';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericAnswer } from '@app/core/models/numeric-answer';
import { EventService } from '@app/core/services/util/event.service';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { Router } from '@angular/router';
import { Location, NgClass } from '@angular/common';
import { LeaderboardPageComponent } from '@app/participant/leaderboard-page/leaderboard-page.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { MatTooltip } from '@angular/material/tooltip';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { ContentPrioritizationParticipantComponent } from '@app/participant/content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentSortParticipantComponent } from '@app/participant/content/content-sort-participant/content-sort-participant.component';
import { ContentTextParticipantComponent } from '@app/participant/content/content-text-participant/content-text-participant.component';
import { ContentScaleParticipantComponent } from '@app/participant/content/content-scale-participant/content-scale-participant.component';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { FormsModule } from '@angular/forms';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { MatIcon } from '@angular/material/icon';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CoreModule } from '@app/core/core.module';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentState } from '@app/core/models/content-state';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { Room } from '@app/core/models/room';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AnswerResultType } from '@app/core/models/answer-result';
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ShortAnswerAnswer } from '@app/core/models/short-answer-answer';
import { STEPPER_ANIMATION_DURATION } from '@app/standalone/stepper/stepper.component';

interface ContentActionTab {
  route: string;
  label: string;
  hotkey: string;
  icon: string;
}

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss'],
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    MatCard,
    FlexModule,
    ContentWaitingComponent,
    RenderedTextComponent,
    MatTabNav,
    MatTabLink,
    MatIcon,
    ExtensionPointModule,
    CountdownTimerComponent,
    MatTabNavPanel,
    FormsModule,
    ContentChoiceParticipantComponent,
    ContentScaleParticipantComponent,
    ContentTextParticipantComponent,
    ContentSortParticipantComponent,
    ContentWordcloudParticipantComponent,
    ContentPrioritizationParticipantComponent,
    ContentNumericParticipantComponent,
    ContentShortAnswerParticipantComponent,
    NgClass,
    MatButton,
    LoadingButtonComponent,
    MatIconButton,
    MatTooltip,
    ContentResultsComponent,
    DividerComponent,
    LeaderboardPageComponent,
    TranslocoPipe,
    LanguageContextDirective,
    LanguageDirectionPipe,
  ],
})
export class ContentParticipantComponent
  extends FormComponent
  implements OnInit, OnChanges
{
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) userId!: string;
  @Input() lastContent = false;
  @Input() active = false;
  @Input({ required: true }) index!: number;
  @Input() statsPublished = false;
  @Input() correctOptionsPublished = false;
  @Input() attribution?: string;
  @Input() alias?: RoomUserAlias;
  @Input() showCard = true;
  @Input() hasAbstained = false;
  @Input() answerResult?: AnswerResultType;
  @Input() activeTab?: string;
  @Output() answerChanged = new EventEmitter<AnswerResultType>();
  @Output() next = new EventEmitter<void>();
  @Output() answerReset = new EventEmitter<string>();

  private answerSubmitted$ = new Subject<string>();
  answer?: Answer;
  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  answersString = '';
  extensionData: any;
  alreadySent = false;
  isMultiple = false;
  HotkeyAction = HotkeyAction;
  a11yMsg?: string;
  language?: string;

  // TODO: non-null assertion operator is used here temporaly. We need to make this component generic with a future refactoring.
  choiceContent!: ContentChoice;
  prioritizationContent!: ContentPrioritization;
  flashcardContent!: ContentFlashcard;
  scaleContent!: ContentScale;
  wordloudContent!: ContentWordcloud;
  numericContent!: ContentNumeric;

  choiceAnswer?: ChoiceAnswer;
  prioritizationAnswer?: PrioritizationAnswer;
  wordcloudAnswer?: MultipleTextsAnswer;
  textAnswer?: TextAnswer;
  numericAnswer?: NumericAnswer;
  shortAnswerAnswer?: ShortAnswerAnswer;

  selectedRoute = '';
  endDate?: Date;
  answeringLocked = false;
  GroupType = GroupType;
  PublishingMode = PublishingMode;
  waitForCountdown = true;

  tabs: ContentActionTab[] = [
    {
      route: '',
      label: 'participant.answer.my-answer',
      hotkey: '1',
      icon: 'person_edit',
    },
    {
      route: 'results',
      label: 'participant.answer.results',
      hotkey: '2',
      icon: 'insert_chart',
    },
    {
      route: 'leaderboard',
      label: 'content.leaderboard',
      hotkey: '3',
      icon: 'emoji_events',
    },
  ];

  constructor(
    protected formService: FormService,
    private router: Router,
    private location: Location,
    private eventService: EventService,
    private contentService: ContentService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private contentPublishService: ContentPublishService,
    private answerService: ContentAnswerService
  ) {
    super(formService);
  }

  get answerSubmitted(): Observable<string> {
    return this.answerSubmitted$;
  }

  ngOnInit(): void {
    this.language = this.room.language;
    if (this.active) {
      this.selectedRoute = this.activeTab || '';
      this.checkForCountdown();
    }
    this.setExtensionData(this.content.roomId, this.content.id);
    this.initContentData();
    this.isMultiple = (this.content as ContentChoice).multiple;
    this.a11yMsg = this.getA11yMessage();
    this.answerService
      .getAnswersByUserIdContentIds(this.content.roomId, this.userId, [
        this.content.id,
      ])
      .subscribe({
        next: (answer) => {
          if (answer[0]) {
            this.answer = answer[0];
            this.alreadySent = true;
            this.initAnswerData();
          }
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
    this.eventService
      .on<EntityChangeNotification>('EntityChangeNotification')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((notification) => {
        if (notification.payload.id === this.content.id) {
          this.reloadContent();
        }
      });
  }

  reloadContent() {
    this.contentService
      .getContent(this.content.roomId, this.content.id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((content) => {
        const newState = content.state;
        if (
          this.content.state.round !== newState.round ||
          (this.answeringLocked && !newState.answeringEndTime)
        ) {
          this.content.state = newState;
          this.resetAnswer();
          const msg = this.translateService.translate(
            content.state.round === 1
              ? 'participant.content.answers-reset'
              : 'participant.content.new-round-started'
          );
          this.notificationService.show(msg);
          if (content.state.round > 1 && newState.answeringEndTime) {
            this.startCountdown(newState.answeringEndTime);
          }
          this.updateTab('');
        } else if (this.isContentStarted(newState)) {
          this.startCountdown(newState.answeringEndTime!);
        } else if (this.isContentStopped(newState)) {
          this.answeringLocked = true;
        }
        this.content.state = newState;
      });
  }

  private isContentStarted(newState: ContentState): boolean {
    return !this.content.state.answeringEndTime && !!newState.answeringEndTime;
  }

  private isContentStopped(newState: ContentState): boolean {
    return (
      !!this.content.state.answeringEndTime &&
      !!newState.answeringEndTime &&
      newState.answeringEndTime !== this.content.state.answeringEndTime
    );
  }

  private resetAnswer(): void {
    this.answerReset.emit(this.content.id);
    this.alreadySent = false;
    this.answeringLocked = false;
    this.endDate = undefined;
    this.answer = undefined;
    this.resetAnswerData();
  }

  private startCountdown(endDate: Date, timeout = 0): void {
    if (this.active) {
      this.answeringLocked = false;
      this.endDate = new Date(endDate);
      setTimeout(() => {
        this.waitForCountdown = false;
      }, timeout);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.active &&
      changes.active.previousValue !== undefined &&
      changes.active.currentValue &&
      !changes.active.previousValue
    ) {
      this.updateTab(this.selectedRoute);
    }
    if (changes.active && !!changes.active.currentValue) {
      this.checkForCountdown();
    }
  }

  checkForCountdown(): void {
    if (this.contentPublishService.isGroupLive(this.contentGroup)) {
      if (this.content.state.answeringEndTime) {
        const now = new Date();
        if (
          now.getTime() >
          new Date(this.content.state.answeringEndTime).getTime()
        ) {
          this.answeringLocked = true;
        } else {
          this.startCountdown(
            this.content.state.answeringEndTime,
            STEPPER_ANIMATION_DURATION
          );
        }
      }
    }
  }

  private resetAnswerData(): void {
    this.choiceAnswer = undefined;
    this.textAnswer = undefined;
    this.prioritizationAnswer = undefined;
    this.numericAnswer = undefined;
    this.wordcloudAnswer = undefined;
    this.shortAnswerAnswer = undefined;
  }

  initAnswerData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.initChoiceAnswerData();
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.initWordcloudAnswerData();
    } else if (this.content.format === ContentType.TEXT) {
      this.textAnswer = this.answer as TextAnswer;
      this.answersString = this.textAnswer.body ?? '';
    } else if (this.content.format === ContentType.SHORT_ANSWER) {
      this.shortAnswerAnswer = this.answer as ShortAnswerAnswer;
      this.answersString = this.shortAnswerAnswer.text || '';
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationAnswer = this.answer as PrioritizationAnswer;
    } else if (this.content.format === ContentType.SCALE) {
      this.choiceAnswer = this.answer as ChoiceAnswer;
    } else if (this.content.format === ContentType.NUMERIC) {
      this.numericAnswer = this.answer as NumericAnswer;
    }
  }

  initChoiceAnswerData() {
    this.choiceAnswer = this.answer as ChoiceAnswer;
    for (const option of (this.answer as ChoiceAnswer).selectedChoiceIndexes ??
      []) {
      this.answersString = this.answersString.concat(
        (this.content as ContentChoice).options[option].label + ','
      );
    }
  }

  initWordcloudAnswerData() {
    this.wordcloudAnswer = this.answer as MultipleTextsAnswer;
    for (const text of (this.answer as MultipleTextsAnswer).texts ?? []) {
      this.answersString = this.answersString.concat(text + ',');
    }
  }

  initContentData() {
    if (
      [ContentType.CHOICE, ContentType.BINARY, ContentType.SORT].includes(
        this.content.format
      )
    ) {
      this.choiceContent = this.content as ContentChoice;
    } else if (this.content.format === ContentType.WORDCLOUD) {
      this.wordloudContent = this.content as ContentWordcloud;
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationContent = this.content as ContentPrioritization;
    } else if (this.content.format === ContentType.SCALE) {
      this.scaleContent = this.content as ContentScale;
    } else if (this.content.format === ContentType.FLASHCARD) {
      this.flashcardContent = this.content as ContentFlashcard;
    } else if (this.content.format === ContentType.NUMERIC) {
      this.numericContent = this.content as ContentNumeric;
    }
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      roomId: roomId,
      refType: 'content',
      refId: refId,
      detailedView: false,
    };
  }

  submitAnswerEvent($event: MouseEvent, type: string) {
    $event.preventDefault();
    this.answerSubmitted$.next(type);
  }

  forwardAnswerMessage(status: {
    answer?: Answer;
    answerResult: AnswerResultType;
  }) {
    this.answer = status.answer;
    if (this.answer) {
      this.initAnswerData();
    }
    this.answerChanged.emit(status.answerResult);
    setTimeout(() => {
      this.enableForm();
      this.hasAbstained = status.answerResult === AnswerResultType.ABSTAINED;
      this.alreadySent = true;
    }, 100);
  }

  showTab(route: string): boolean {
    switch (route) {
      case '':
        return this.statsPublished || this.contentGroup.leaderboardEnabled;
      case 'results':
        return this.statsPublished;
      case 'leaderboard':
        return this.contentGroup.leaderboardEnabled;
      default:
        return false;
    }
  }

  updateTab(route: string): void {
    this.selectedRoute = route;
    const urlList = [
      'p',
      this.room.shortId,
      'series',
      this.contentGroup.name,
      this.index + 1,
    ];
    if (this.selectedRoute) {
      urlList.push(this.selectedRoute);
    }
    const urlTree = this.router.createUrlTree(urlList);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  getA11yMessage(): string {
    let msg = 'participant.answer.a11y-';
    if (this.alreadySent) {
      msg += 'already-answered';
    } else {
      msg += 'current-';
      let format: string;
      if (this.content.format !== ContentType.CHOICE) {
        format = this.content.format.toLowerCase();
      } else {
        format = (this.content as ContentChoice).multiple
          ? 'multiple'
          : 'single';
      }
      msg += format;
    }
    return msg;
  }

  showWaitingArea(): boolean {
    return (
      !this.answer &&
      ((this.contentPublishService.isGroupLive(this.contentGroup) &&
        !this.endDate &&
        !this.content.state.answeringEndTime) ||
        (this.contentGroup.leaderboardEnabled && !this.alias?.id))
    );
  }

  getIndexInContentGroup(): number {
    return this.contentGroup.contentIds.indexOf(this.content.id);
  }
}
