import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { Location } from '@angular/common';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup, PublishingMode } from '@app/core/models/content-group';
import { ContentType } from '@app/core/models/content-type.enum';
import { Subject, takeUntil } from 'rxjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { UserService } from '@app/core/services/http/user.service';
import { UserSettings } from '@app/core/models/user-settings';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { Room } from '@app/core/models/room';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';

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

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private router: Router,
    private presentationService: PresentationService,
    private userService: UserService,
    private focusModeService: FocusModeService,
    private contentPublishService: ContentPublishService
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
    if (this.contentGroup.publishingMode !== PublishingMode.NONE) {
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

  isLocked(index: number): boolean {
    return this.contentPublishService.isIndexPublished(
      this.contentGroup,
      index
    );
  }
}
