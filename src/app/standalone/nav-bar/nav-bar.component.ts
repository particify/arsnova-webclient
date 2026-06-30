import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  ChangeDetectionStrategy,
  computed,
  linkedSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  Subject,
  Subscription,
  combineLatest,
  filter,
  map,
  switchMap,
  takeUntil,
} from 'rxjs';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { RoomService } from '@app/core/services/http/room.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { Room } from '@app/core/models/room';
import { TranslocoPipe } from '@jsverse/transloco';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import {
  PublishedQuestionnairesByRoomIdGql,
  QnaState,
  QnaStateChangedGql,
  QuestionnairesByRoomIdGql,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
  RoomStatsByIdGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RoomSettings } from '@app/core/models/room-settings';
import { refetchOn } from '@gql/helper/refetch-on';
import { EventService } from '@app/core/services/util/event.service';
import { RoomDeletionStarted } from '@app/core/models/events/room-deletion-started';

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
  changeDetection: ChangeDetectionStrategy.Eager,
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
  protected readonly router = inject(Router);
  protected readonly routingService = inject(RoutingService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly globalStorageService = inject(GlobalStorageService);
  protected readonly roomStatsService = inject(RoomStatsService);
  protected readonly roomSettingsService = inject(RoomSettingsService);
  protected readonly contentGroupService = inject(ContentGroupService);
  protected readonly roomService = inject(RoomService);
  protected readonly focusModeService = inject(FocusModeService);
  protected readonly roomStatsByIdGql = inject(RoomStatsByIdGql);
  protected readonly qnaStateChanged = inject(QnaStateChangedGql);
  protected readonly questionnairesByRoomId = inject(QuestionnairesByRoomIdGql);
  protected readonly publishedQuestionnairesByRoomId = inject(
    PublishedQuestionnairesByRoomIdGql
  );
  protected readonly questionnairesChanged = inject(QuestionnairesChangedGql);
  private readonly roomEvents = inject(EventService);

  readonly roomId = input.required<string>();
  readonly qnaEnabled = input<boolean>();
  readonly userRole = input.required<UserRole>();
  readonly viewRole = input.required<UserRole>();
  readonly room = input.required<Room>();
  readonly roomSettings = input.required<RoomSettings>();

  readonly questionnairesState = toSignal(
    combineLatest([
      toObservable(this.roomId),
      toObservable(this.viewRole),
    ]).pipe(
      switchMap(([roomId, viewRole]) => {
        // Deleting the room deletes its questionnaires too; refetching the list
        // of a room that is gone would only fail.
        const deletionStarted$ = this.roomEvents
          .on<RoomDeletionStarted['payload']>('RoomDeletionStarted')
          .pipe(filter((e) => e.id === roomId));
        const changed$ = this.questionnairesChanged
          .subscribe({ variables: { roomId } })
          .pipe(takeUntil(deletionStarted$));
        if (viewRole === UserRole.PARTICIPANT) {
          return refetchOn(
            this.publishedQuestionnairesByRoomId.watch({
              variables: { roomId },
            }),
            changed$
          ).pipe(
            map((r) => ({
              questionnaires: (
                r.data?.publishedQuestionnairesByRoomId ?? []
              ).filter((n): n is QuestionnaireSummaryFragment => !!n),
              loading: r.loading,
            }))
          );
        }

        return refetchOn(
          this.questionnairesByRoomId.watch({ variables: { roomId } }),
          changed$
        ).pipe(
          map((r) => ({
            questionnaires: (r.data?.questionnairesByRoomId ?? []).filter(
              (n): n is QuestionnaireSummaryFragment => !!n
            ),
            loading: r.loading,
          }))
        );
      })
    ),
    { initialValue: { questionnaires: [], loading: true } }
  );

  readonly questionnaires = computed(
    () => this.questionnairesState().questionnaires
  );
  protected readonly loadingQuestionnaires = computed(
    () => this.questionnairesState().loading
  );

  readonly activeQuestionnaire = linkedSignal(() => {
    const id = this.route.snapshot.params.questionnaireId;
    const first = this.questionnaires()[0];
    return this.questionnaires().find((q) => q.id === id) ?? first;
  });

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
  private changesSubscription?: Subscription;
  private statsChangesSubscription?: Subscription;
  private publishedQuestionnaireIds?: Set<string>;

  userCount = toSignal(
    toObservable(this.roomId).pipe(
      switchMap(
        (id) => this.roomStatsByIdGql.watch({ variables: { id } }).valueChanges
      ),
      map((s) => s.data?.roomById?.stats?.activeMemberCount)
    )
  );
  focusFeature?: RoutingFeature;
  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());

  constructor() {
    let questionnaireId = this.routingService.questionnaireId;
    if (questionnaireId === undefined) {
      questionnaireId = this.globalStorageService.getItem(
        STORAGE_KEYS.LAST_GROUP
      );
    } else {
      this.setGroupInSessionStorage(questionnaireId);
    }
    toObservable(this.questionnairesState).subscribe({
      next: ({ questionnaires, loading }) => {
        if (questionnaires.length > 0) {
          this.setGroupInSessionStorage(
            questionnaireId ?? questionnaires[0].id
          );
          this.addContentFeatureItem(false);
        } else if (!loading) {
          this.removeContentFeatureItem();
        }
        this.getItems();
        if (!loading) {
          this.announceNewlyPublishedQuestionnaires(questionnaires);
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.statsChangesSubscription) {
      this.statsChangesSubscription.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit() {
    if (
      this.roomSettings()?.surveyEnabled ||
      this.viewRole() !== UserRole.PARTICIPANT
    ) {
      this.activeFeatures.splice(1, 0, RoutingFeature.FEEDBACK);
    }
    if (this.qnaEnabled() || this.viewRole() !== UserRole.PARTICIPANT) {
      this.activeFeatures.splice(1, 0, RoutingFeature.COMMENTS);
    }
    this.subscribeToParticipantEvents();
    this.subscribeToRouteChanges();
    this.subscribeToFocusState();
  }

  private subscribeToFocusState() {
    if (this.userRole() === UserRole.PARTICIPANT) {
      return;
    }
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

  /**
   * Flags the questionnaire item for participants once a questionnaire gets
   * published. Route data's `userRole` keeps a creator's room preview quiet.
   */
  private announceNewlyPublishedQuestionnaires(
    questionnaires: QuestionnaireSummaryFragment[]
  ) {
    const known = this.publishedQuestionnaireIds;
    this.publishedQuestionnaireIds = new Set(questionnaires.map((q) => q.id));
    if (!known || this.userRole() !== UserRole.PARTICIPANT) {
      return;
    }
    const published = questionnaires.find((q) => !known.has(q.id));
    if (published) {
      this.toggleNews(RoutingFeature.CONTENTS, published);
    }
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }

  removeGroupInSessionStorage() {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
  }

  subscribeToParticipantEvents() {
    if (this.viewRole() === UserRole.PARTICIPANT) {
      const roomSettingsId = this.roomSettings()?.id;
      if (!roomSettingsId) {
        return;
      }
      this.roomSettingsService
        .getRoomSettingsStream(this.room().id, roomSettingsId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((settings) => {
          const surveyEnabled = this.activeFeatures.includes(
            RoutingFeature.FEEDBACK
          );
          if (!surveyEnabled && settings.surveyEnabled) {
            this.activeFeatures.push(RoutingFeature.FEEDBACK);
            this.getItems();
            this.toggleNews(RoutingFeature.FEEDBACK);
          } else if (surveyEnabled && !settings.surveyEnabled) {
            const index = this.activeFeatures.indexOf(RoutingFeature.FEEDBACK);
            this.activeFeatures.splice(index, 1);
            this.getItems();
          }
        });
      this.qnaStateChanged
        .subscribe({ variables: { roomId: this.roomId() } })
        .subscribe((r) => {
          if (r.data?.qnaStateChanged?.state === QnaState.Started) {
            if (!this.activeFeatures.includes(RoutingFeature.COMMENTS)) {
              this.activeFeatures.splice(1, 0, RoutingFeature.COMMENTS);
              this.getItems();
              this.toggleNews(RoutingFeature.COMMENTS);
            }
          } else if (r.data?.qnaStateChanged?.state === QnaState.Stopped) {
            if (this.activeFeatures.includes(RoutingFeature.COMMENTS)) {
              const index = this.activeFeatures.indexOf(
                RoutingFeature.COMMENTS
              );
              this.activeFeatures.splice(index, 1);
              this.getItems();
            }
          }
        });
    }
  }

  subscribeToRouteChanges() {
    this.routingService.getRouteChanges().subscribe((route) => {
      const newQuestionnaireId = route.params['questionnaireId'];
      if (
        newQuestionnaireId &&
        newQuestionnaireId !== this.activeQuestionnaire()?.id
      ) {
        this.updateQuestionnaire(newQuestionnaireId);
      }
      this.getCurrentRouteIndex();
      if (this.currentRouteIndex && this.currentRouteIndex > -1) {
        this.disableNewsForCurrentRoute();
      }
    });
  }

  getItems() {
    for (const feature of this.features) {
      const index = this.activeFeatures.indexOf(feature.name);
      const barIndex = this.barItems.map((b) => b.name).indexOf(feature.name);
      if (index > -1) {
        if (barIndex < 0) {
          this.barItems.splice(
            index,
            0,
            new NavBarItem(
              feature.name,
              feature.icon,
              this.getFeatureUrl(feature.name),
              false
            )
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
      this.router.url ===
        this.router.serializeUrl(this.router.createUrlTree(this.getBaseUrl()))
    ) {
      return true;
    }
    return !!barItem.url && this.router.url.includes(barItem.url);
  }

  private getFeatureUrl(feature: string): string {
    const url = this.getBaseUrl();
    if (feature) {
      url.push(feature);
    }
    return this.router.serializeUrl(this.router.createUrlTree(url));
  }

  private getBaseUrl(): string[] {
    return [
      this.routingService.getRoleRoute(
        this.viewRole() === UserRole.PARTICIPANT
          ? UserRole.PARTICIPANT
          : undefined
      ),
      this.room().shortId,
    ];
  }

  navToUrl(index: number, questionnaire?: QuestionnaireSummaryFragment) {
    const item = this.barItems[index];
    if (questionnaire) {
      this.activeQuestionnaire.set(questionnaire);
    } else {
      if (this.isMenuActive(item.name)) {
        return;
      }
    }
    const route = [
      this.routingService.getRoleRoute(this.viewRole()),
      this.room().shortId,
    ];
    if (item.name !== RoutingFeature.OVERVIEW) {
      route.push(item.name);
      const questionnaireId = this.activeQuestionnaire()?.id;
      if (item.name === RoutingFeature.CONTENTS && questionnaireId) {
        route.push(questionnaireId);
      }
    }
    this.router.navigate(route);
  }

  disableNewsForCurrentRoute() {
    if (this.currentRouteIndex) {
      this.barItems[this.currentRouteIndex].changeIndicator = false;
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

  getBarIndexOfFeature(name: string): number {
    return this.barItems.map((b) => b.name).indexOf(name);
  }

  updateQuestionnaire(id: string) {
    const questionnaire = this.questionnaires().find((q) => q.id === id);
    if (!questionnaire) {
      return;
    }
    this.activeQuestionnaire.set(questionnaire);
    const groupBarIndex = this.getBarIndexOfFeature(RoutingFeature.CONTENTS);
    if (this.barItems[groupBarIndex]) {
      this.barItems[groupBarIndex].url = this.getFeatureUrl(
        RoutingFeature.CONTENTS
      );
    }
    this.setGroupInSessionStorage(questionnaire.id);
  }

  noContentsPublished(first: number, last: number) {
    return first === -1 && last === -1;
  }

  toggleNews(feature: string, questionnaire?: QuestionnaireSummaryFragment) {
    const featureIndex = this.getBarIndexOfFeature(feature);
    if (
      featureIndex !== this.currentRouteIndex ||
      (questionnaire &&
        this.activeQuestionnaire() &&
        questionnaire.id !== this.activeQuestionnaire().id)
    ) {
      this.barItems[featureIndex].changeIndicator = true;
    }
  }

  getFeatureText(feature: string) {
    return feature === RoutingFeature.CONTENTS &&
      this.questionnaires().length === 1
      ? this.activeQuestionnaire()?.name
      : 'sidebar.' + feature;
  }

  isMenuActive(feature: string): boolean {
    return (
      feature === RoutingFeature.CONTENTS && this.questionnaires().length > 1
    );
  }

  checkMenu(feature: string, trigger: MatMenuTrigger) {
    if (!this.isMenuActive(feature)) {
      trigger.closeMenu();
    }
  }

  getFocusInfo(feature: string) {
    if (!this.focusModeEnabled()) {
      return '';
    }
    return feature === this.focusFeature ? 'creator.sidebar.focus-feature' : '';
  }
}
