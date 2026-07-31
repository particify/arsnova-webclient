import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { CreateContentGroupTemplateComponent } from '@app/creator/questionnaire/_dialogs/create-content-group-template/create-content-group-template.component';
import { ContentGroupSettingsComponent } from '@app/standalone/content-group-settings/content-group-settings.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { switchMap, map, filter } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard } from '@angular/material/card';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import {
  Content,
  DeleteQuestionnaireGql,
  Questionnaire,
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import { ContentListComponent } from './content-list/content-list.component';
import { QuestionnairePageService } from './questionnaire-page.service';
import { RoutingService } from '@app/core/services/util/routing.service';

const STATUS_OKAY = 50;
const STATUS_BETTER = 62.5;
const STATUS_GOOD = 75;
const STATUS_EXCELLENT = 87.5;

export interface ContentStats {
  count: number;
  correct?: number;
  abstentions?: number;
}

@Component({
  selector: 'app-questionnaire-page',
  templateUrl: './questionnaire-page.component.html',
  styleUrls: ['./questionnaire-page.component.scss'],
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    MatButton,
    HotkeyDirective,
    RouterLink,
    MatIcon,
    MatIconButton,
    MatTooltip,
    NgClass,
    ExtendedModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    ExtensionPointComponent,
    TrackInteractionDirective,
    FeatureFlagDirective,
    MatDivider,
    MatProgressBar,
    MatCard,
    RouterOutlet,
    BackButtonComponent,
    TranslocoPipe,
    QuestionnaireInfoComponent,
    ContentListComponent,
  ],
})
export class QuestionnairePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly router = inject(Router);
  private readonly routingService = inject(RoutingService);
  private readonly localFileService = inject(LocalFileService);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly toggleQuestionnairePublished = inject(
    ToggleQuestionnairePublishedGql
  );
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private readonly deleteQuestionnaire = inject(DeleteQuestionnaireGql);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly questionnaireById = inject(QuestionnaireByIdGql);

  readonly userRole = input.required<UserRole>();
  readonly roomId = input.required<string>();
  readonly questionnaireId = input.required<string>();
  readonly shortId = input.required<string>();
  readonly published = computed(() => this.questionnaire()?.published ?? false);
  readonly isModerator = computed(() => this.userRole() === UserRole.MODERATOR);
  readonly questionnaire = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((id) =>
        this.questionnaireById.watch({ variables: { id } }).valueChanges.pipe(
          map((r) => r.data?.questionnaireById),
          filter((n): n is Questionnaire => !!n)
        )
      )
    )
  );
  readonly contentsResult = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) => {
        return this.contentsByQuestionnareId.watch({
          variables: { questionnaireId: questionnaireId },
        }).valueChanges;
      })
    )
  );
  readonly contents = computed(() => {
    const edges =
      this.contentsResult()?.data?.questionnaireContentsByQuestionnaireId
        ?.edges;
    return edges?.map((e) => e?.node).filter((n): n is Content => !!n) ?? [];
  });
  readonly loadingContents = computed(() => this.contentsResult()?.loading);

  isLoading = true;

  readonly isGuest = toSignal(
    this.authService.getCurrentAuthentication().pipe(map((a) => !a?.verified)),
    { initialValue: true }
  );

  attributionsExist = false;
  QuestionnaireType = QuestionnaireType;
  totalCorrect?: number;
  totalAbstentions?: number;
  showLeaderboard = false;
  creationMode = false;
  editMode = false;
  selectedContentId = signal<string | undefined>(undefined);
  isDesktop?: boolean;
  childActive = false;

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.determinateRouteState();
      });
    this.questionnairePageService
      .getEditedContent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['.'], { relativeTo: this.route });
      });
    effect(() => {
      if (!this.loadingContents()) {
        this.determinateRouteState();
        this.navigateToFirstContent();
        if (this.contents().length === 0 && this.isDesktop) {
          this.openCreation();
        }
      }
      if (this.questionnaire()) {
        this.globalStorageService.setItem(
          STORAGE_KEYS.LAST_GROUP,
          this.questionnaire()?.id
        );
      }
    });
    this.breakpointObserver
      .observe(['(min-width: 1000px)'])
      .subscribe((changes) => {
        const temp = this.isDesktop;
        this.isDesktop = changes.matches;
        if (temp !== undefined && temp !== changes.matches) {
          this.determinateRouteState();
          this.navigateToFirstContent();
          if (this.contents().length === 0 && this.isDesktop) {
            this.openCreation();
          }
        }
      });
  }

  private determinateRouteState() {
    const child = this.route.firstChild;
    const childPath = child?.snapshot.routeConfig?.path;
    this.showLeaderboard = childPath === 'leaderboard';
    this.creationMode = childPath === 'create';
    this.editMode = !!childPath?.includes('edit');
    if (childPath === 'attributions' && this.isDesktop) {
      this.selectedContentId.set(undefined);
    }
    this.childActive = !!child;
    this.evaluateRouteStateChild(child, childPath);
  }

  private evaluateRouteStateChild(
    route: ActivatedRoute | null,
    path: string | undefined
  ) {
    if (!route) {
      if (this.selectedContentId() !== undefined && this.isDesktop) {
        this.router.navigate([this.selectedContentId()], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      }
      return;
    }
    if (path) {
      const contentId = route.snapshot.params.contentId;
      if (contentId) {
        this.selectedContentId.set(contentId);
      }
    }
  }

  private navigateToFirstContent() {
    if (
      this.isDesktop &&
      this.selectedContentId() === undefined &&
      !this.showLeaderboard &&
      !this.creationMode &&
      !this.editMode &&
      this.contents().length > 0
    ) {
      this.router.navigate([this.contents()[0].id], {
        relativeTo: this.route,
        replaceUrl: true,
      });
    }
  }

  generateExportFilename(extension: string): string {
    const questionnaireName = this.questionnaire()?.name ?? '';
    const name = this.localFileService.generateFilename(
      [questionnaireName, this.shortId()],
      true
    );
    return `${name}.${extension}`;
  }

  exportToCsv() {
    // TODO: Export contents to CSV
  }

  importFromCsv() {
    // TODO: Import contents from CSV
  }

  deleteAllAnswers() {
    // TODO: Delete results of all contents
  }

  deleteGroup() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-group',
      'creator.dialog.really-delete-content-group',
      this.questionnaire()?.name,
      undefined,
      () =>
        this.deleteQuestionnaire.mutate({
          variables: { id: this.questionnaireId() },
          update: (cache, result) => {
            if (result.data?.deleteQuestionnaire) {
              const cacheId = cache.identify({
                __typename: 'Questionnaire',
                id: this.questionnaireId(),
              });
              if (cacheId) {
                cache.evict({ id: cacheId });
                cache.gc();
              }
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate([
          this.routingService.getRoleRoute(),
          this.shortId(),
        ]);
        this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
        const msg = this.translateService.translate(
          'creator.content.content-group-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  publish(): void {
    this.toggleQuestionnairePublished
      .mutate({
        variables: { id: this.questionnaireId(), published: true },
      })
      .subscribe({
        next: (r) => {
          if (r.data?.toggleQuestionnairePublished) {
            const msg = this.translateService.translate(
              'creator.content.group-published'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        },
      });
  }

  createTemplate() {
    this.dialogService.openDialog(CreateContentGroupTemplateComponent, {
      width: '600px',
      data: {
        name: this.questionnaire()?.name,
        contentGroupId: this.questionnaireId(),
      },
    });
  }

  openSettings(): void {
    const dialogRef = this.dialogService.openDialog(
      ContentGroupSettingsComponent,
      {
        width: '600px',
        data: {
          contentGroup: { ...this.questionnaire() },
          groupNames: [this.questionnaire()?.name],
        },
      }
    );
    dialogRef.afterClosed().subscribe((contentGroup) => {
      if (contentGroup) {
        const msg = this.translateService.translate(
          'creator.content.changes-made'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      }
    });
  }

  handleActiveContentChanged(id?: string): void {
    if (this.selectedContentId() !== id && !this.childActive) {
      this.router.navigate(['.', id], { relativeTo: this.route });
    }
  }

  isLiveMode(): boolean {
    return (
      this.questionnaire()?.publishingMode === QuestionnairePublishingMode.Live
    );
  }

  getProgressColor(): string {
    if (!this.totalCorrect) {
      return '';
    } else {
      if (this.totalCorrect < STATUS_OKAY) {
        return 'red';
      } else if (this.totalCorrect < STATUS_BETTER) {
        return 'orange';
      } else if (this.totalCorrect < STATUS_GOOD) {
        return 'yellow';
      } else if (this.totalCorrect < STATUS_EXCELLENT) {
        return 'green';
      } else {
        return 'blue';
      }
    }
  }

  toggleLeaderboard() {
    const url = ['.'];
    if (this.showLeaderboard) {
      const selectedContentId = this.selectedContentId();
      if (selectedContentId !== undefined) {
        url.push(selectedContentId);
      }
    } else {
      url.push('leaderboard');
    }
    this.router.navigate(url, {
      relativeTo: this.route,
    });
    this.showLeaderboard = !this.showLeaderboard;
  }

  private openCreation() {
    this.router.navigate(['create'], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
}
