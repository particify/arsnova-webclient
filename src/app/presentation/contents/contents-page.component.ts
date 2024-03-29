import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService } from '@ngneat/transloco';
import { Content } from '@app/core/models/content';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { Location } from '@angular/common';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Subject, take, takeUntil } from 'rxjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { UserService } from '@app/core/services/http/user.service';
import { UserSettings } from '@app/core/models/user-settings';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { ContentPublishActionType } from '@app/core/models/content-publish-action.enum';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { Room } from '@app/core/models/room';
import { PublishContentComponent } from '@app/presentation/contents/_dialogs/publish-content/publish-content.component';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';

@Component({
  selector: 'app-contents-page',
  templateUrl: './contents-page.component.html',
  styleUrls: ['./contents-page.component.scss'],
})
export class ContentsPageComponent implements OnInit, OnDestroy {
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  destroyed$ = new Subject<void>();

  contents: Content[] = [];
  isLoading = true;
  entryIndex = 0;
  contentIndex = 0;
  shortId: string;
  room: Room;
  contentGroupName: string;
  currentStep = 0;
  answerCount = 0;
  indexChanged: EventEmitter<void> = new EventEmitter<void>();
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  contentGroup!: ContentGroup;
  canAnswerContent = false;
  settings = new UserSettings();
  attributions: ContentLicenseAttribution[] = [];
  stepCount = 0;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private translateService: TranslocoService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private router: Router,
    private dialogService: DialogService,
    private hotkeyService: HotkeyService,
    private presentationService: PresentationService,
    private userService: UserService,
    private contentPublishService: ContentPublishService,
    private focusModeService: FocusModeService
  ) {
    const routeSeriesName = this.route.snapshot.params['seriesName'];
    // Use index from route if available. Otherwise use the stored index or 0 as fallback.
    const routeContentIndex =
      (this.route.snapshot.params['contentIndex'] ?? 0) - 1;
    const lastIndex =
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_INDEX) ?? 0;
    this.entryIndex = routeContentIndex > -1 ? routeContentIndex : lastIndex;
    this.contentGroupName =
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP) ||
      routeSeriesName;
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.contentGroupName
    );
    this.room = this.route.snapshot.data.room;
    this.shortId = this.route.snapshot.data.room.shortId;
  }

  ngOnInit() {
    const loginId = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    ).loginId;
    this.userService.getUserSettingsByLoginId(loginId).subscribe((settings) => {
      if (settings) {
        this.settings = settings;
      }
      this.initGroup(true);
    });
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initScale() {
    const scale = this.presentationService.getScale();
    const stepperContainer = document.getElementById('stepper-container');
    if (stepperContainer) {
      stepperContainer.style.transform = `scale(${scale})`;
      stepperContainer.style.left = `calc(50vw - calc(305px * ${scale})`;
      stepperContainer.style.top = `calc(4vw - calc(1em * ${scale}))`;
    }
  }

  initGroup(initial = false) {
    this.contentGroupService
      .getByRoomIdAndName(this.room.id, this.contentGroupName, true)
      .subscribe((group) => {
        this.contentGroup = group;
        if (this.contentGroup.contentIds) {
          this.contentService
            .getContentsByIds(
              this.contentGroup.roomId,
              this.contentGroup.contentIds,
              true
            )
            .subscribe((contents) => {
              this.contents =
                this.contentService.getSupportedContents(contents);
              this.finishInit(initial);
              if (this.entryIndex > -1) {
                this.contentIndex = initial ? this.entryIndex : 0;
                this.currentStep = this.contentIndex;
                this.stepCount = this.contents.length;
                this.contentGroupService
                  .getAttributions(this.room.id, this.contentGroup.id)
                  .pipe(takeUntil(this.destroyed$))
                  .subscribe((attributions) => {
                    if (attributions.length > 0) {
                      this.attributions = attributions;
                      this.stepCount++;
                    }
                    setTimeout(() => {
                      this.stepper?.init(this.contentIndex, this.stepCount);
                      this.updateURL(this.contentIndex, true);
                      if (!initial) {
                        this.updateStateChange();
                      }
                    }, 0);
                  });
              }
              this.sendContentStepState();
            });
        } else {
          this.finishInit(initial);
          this.sendContentStepState(true);
        }
      });
  }

  finishInit(initial: boolean) {
    this.isLoading = false;
    if (initial) {
      this.initScale();
      this.presentationService
        .getCurrentGroup()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((group) => {
          this.isLoading = true;
          this.contentGroupName = group;
          this.initGroup();
        });
      this.translateService
        .selectTranslate('creator.control-bar.publish-or-lock-content')
        .pipe(take(1))
        .subscribe((t) =>
          this.hotkeyService.registerHotkey(
            {
              key: 'l',
              action: () => this.updatePublishedState(),
              actionTitle: t,
            },
            this.hotkeyRefs
          )
        );
    }
  }

  updateRoute(rolePrefix: string, index: number) {
    const urlTree = this.router.createUrlTree([
      rolePrefix,
      this.shortId,
      'series',
      this.contentGroupName,
      index,
    ]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  updateURL(index: number, initial = false) {
    if (this.currentStep === index && !initial) {
      return;
    }
    this.currentStep = index;
    const urlIndex = index + 1;
    this.updateRoute('present', urlIndex);
    this.sendContentStepState();
    if (
      this.attributions.length > 0 &&
      this.currentStep === this.stepCount - 1
    ) {
      return;
    }
    if (this.contentGroup.published) {
      this.updateStateChange();
    }
    this.canAnswerContent = ![
      ContentType.SLIDE,
      ContentType.FLASHCARD,
    ].includes(this.contents[this.currentStep].format);
    if (index !== this.entryIndex) {
      this.contentIndex = -1;
    }
    setTimeout(() => {
      this.indexChanged.emit();
    }, 300);
  }

  updateCounter(count: number, isActive: boolean) {
    if (isActive) {
      this.answerCount = count;
    }
  }

  updateStateChange() {
    this.focusModeService.updateContentState(
      this.room,
      this.contents[this.currentStep].id,
      this.currentStep,
      this.contentGroup.id,
      this.contentGroup.name
    );
  }

  sendContentStepState(emptyList = false) {
    let position;
    let index;
    if (!emptyList) {
      index = this.currentStep;
      position = this.presentationService.getStepState(
        this.currentStep,
        this.stepCount
      );
      const state = new ContentPresentationState(
        position,
        index,
        this.contents[this.currentStep]
      );
      this.presentationService.updateContentState(state);
    }
  }

  lockContent() {
    // Check if current content is the only one which is published
    if (
      this.contentPublishService.isSingleContentPublished(this.contentGroup)
    ) {
      // Lock all contents
      this.updateContentGroup(-1, -1);
      return;
    }
    let firstIndex = this.contentGroup.firstPublishedIndex;
    let lastIndex = this.contentGroup.lastPublishedIndex;
    // Check if current content is first one of range
    if (
      this.contentPublishService.isFirstPublished(
        this.contentGroup,
        this.currentStep
      )
    ) {
      // Reduce the range to the next content
      firstIndex = this.currentStep + 1;
      this.updateContentGroup(firstIndex, lastIndex);
      return;
    }
    // Check if current content is last one of range
    if (
      this.contentPublishService.isLastPublished(
        this.contentGroup,
        this.currentStep
      )
    ) {
      // Reduce the range to the previous content
      lastIndex = this.currentStep - 1;
      this.updateContentGroup(firstIndex, lastIndex);
      return;
    }
    // If current content is in the middle of the range, open dialog to choose new range
    const dialogRef = this.dialogService.openDialog(PublishContentComponent, {
      data: 'lock',
    });
    dialogRef.afterClosed().subscribe((action) => {
      if (action === ContentPublishActionType.UP_TO_HERE) {
        firstIndex = this.currentStep + 1;
        if (lastIndex === -1 && this.contentGroup.contentIds) {
          lastIndex = this.contentGroup.contentIds.length - 1;
        }
      } else if (action === ContentPublishActionType.FROM_HERE) {
        lastIndex = this.currentStep - 1;
      }
      this.updateContentGroup(firstIndex, lastIndex);
    });
  }

  publishContent() {
    let firstIndex = this.contentGroup.firstPublishedIndex;
    let lastIndex = this.contentGroup.lastPublishedIndex;
    // Check if current content is not before range
    if (
      !this.contentPublishService.isBeforeRange(
        this.contentGroup,
        this.currentStep
      ) &&
      !this.contentPublishService.isDirectlyAfterRange(
        this.contentGroup,
        this.currentStep
      )
    ) {
      // Open dialog to choose new range
      const dialogRef = this.dialogService.openDialog(PublishContentComponent, {
        data: 'publish',
      });
      dialogRef.afterClosed().subscribe((action) => {
        if (action === ContentPublishActionType.SINGLE) {
          this.updateContentGroup(this.currentStep, this.currentStep);
        } else if (action === ContentPublishActionType.UP_TO_HERE) {
          this.updateContentGroup(firstIndex, this.currentStep);
        }
      });
      return;
    }
    // Check if current content is directly after range
    if (
      this.contentPublishService.isDirectlyAfterRange(
        this.contentGroup,
        this.currentStep
      )
    ) {
      // Increase range upwards to current content
      lastIndex = this.currentStep;
    }
    // Check if current content is before range no matter if directly next to range
    if (
      this.contentPublishService.isBeforeRange(
        this.contentGroup,
        this.currentStep
      )
    ) {
      // Increase range downwards to current content
      firstIndex = this.currentStep;
    }
    this.updateContentGroup(firstIndex, lastIndex);
  }

  updatePublishedState() {
    if (!this.contentPublishService.areContentsPublished(this.contentGroup)) {
      this.updateContentGroup(this.currentStep, this.currentStep);
      return;
    }
    if (
      this.contentPublishService.isIndexPublished(
        this.contentGroup,
        this.currentStep
      )
    ) {
      this.lockContent();
    } else {
      this.publishContent();
    }
  }

  updateContentGroup(firstIndex: number, lastIndex: number) {
    const changes: { firstPublishedIndex: number; lastPublishedIndex: number } =
      { firstPublishedIndex: firstIndex, lastPublishedIndex: lastIndex };
    this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .subscribe((updatedContentGroup) => {
        this.contentGroup = updatedContentGroup;
        this.presentationService.updateContentGroup(this.contentGroup);
      });
  }
}
