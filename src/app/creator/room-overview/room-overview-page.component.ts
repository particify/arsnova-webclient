import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { HintType } from '@app/core/models/hint-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
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
import { AsyncPipe } from '@angular/common';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ExpandableCardComponent } from '@app/standalone/expandable-card/expandable-card.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ContentType,
  QuestionnairesByRoomIdGql,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
} from '@gql/generated/graphql';
import { switchMap } from 'rxjs';
import { QuestionnaireComponent } from '@app/standalone/questionnaire/questionnaire.component';
import { refetchOn } from '@gql/helper/refetch-on';

@Component({
  selector: 'app-creator-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['./room-overview-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
    DisabledIfReadonlyDirective,
    RenderedTextComponent,
    ExpandableCardComponent,
    QuestionnaireComponent,
  ],
})
export class RoomOverviewPageComponent extends AbstractRoomOverviewPageComponent {
  protected readonly router = inject(Router);
  protected readonly dialogService = inject(DialogService);
  protected readonly globalStorageService = inject(GlobalStorageService);
  private readonly contentService = inject(ContentService);
  private readonly questionnairesByRoomId = inject(QuestionnairesByRoomIdGql);
  private readonly questionnairesChanged = inject(QuestionnairesChangedGql);

  readonly questionnairesResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) =>
        refetchOn(
          this.questionnairesByRoomId.watch({ variables: { roomId } }),
          this.questionnairesChanged.subscribe({ variables: { roomId } })
        )
      )
    )
  );

  readonly questionnaires = computed(() => {
    return (
      this.questionnairesResult()?.data?.questionnairesByRoomId ?? []
    ).filter((n): n is QuestionnaireSummaryFragment => !!n);
  });

  readonly loadingQuestionnaires = computed(
    () => this.questionnairesResult()?.loading
  );

  readonly userRole = input.required<UserRole>();
  readonly isModerator = computed(() => this.userRole() === UserRole.MODERATOR);

  quesionnaireTypes: Map<QuestionnaireType, string>;
  readonly questionnaireContentFormatIcons = new Map<
    QuestionnaireType,
    Map<ContentType, string>
  >();
  readonly hintType = HintType.INFO;
  expandDescription: boolean;

  constructor() {
    super();
    this.quesionnaireTypes =
      this.contentGroupService.getQuestionnaireTypeIcons();
    this.quesionnaireTypes.forEach((_, key) => {
      const groupTypeIcons = new Map<ContentType, string>();
      const typeIcons = this.contentService.getTypeIcons();
      this.contentGroupService
        .getContentFormatsOfQuestionnaireType(key)
        .forEach((type) => {
          const icon = typeIcons.get(type);
          if (icon && type !== ContentType.Slide) {
            groupTypeIcons.set(type, icon);
          }
        });
      this.questionnaireContentFormatIcons.set(key, groupTypeIcons);
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

  openCreateQuestionnaireDialog(type = QuestionnaireType.Mixed) {
    this.dialogService
      .openQuestionnaireCreationDialog(this.roomId(), type)
      .afterClosed()
      .subscribe((q) => {
        if (q) {
          this.router.navigate(['edit', this.shortId(), 'questionnaire', q.id]);
        }
      });
  }

  navigateToTemplateSelection() {
    this.router.navigate(['edit', this.shortId(), 'templates']);
  }
}
