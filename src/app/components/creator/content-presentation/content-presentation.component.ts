import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../services/util/global-storage.service';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { Location } from '@angular/common';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { InfoBarItem } from '../../shared/bars/info-bar/info-bar.component';
import { EventService } from '../../../services/util/event.service';
import { ContentGroup } from '../../../models/content-group';
import { DialogService } from '../../../services/util/dialog.service';
import { PublishContentComponent } from '../_dialogs/publish-content/publish-content.component';
import { ContentType } from '../../../models/content-type.enum';
import { HotkeyService } from '../../../services/util/hotkey.service';
import { Subscription } from 'rxjs';
import { PresentationService } from '../../../services/util/presentation.service';
import { UserService } from '../../../services/http/user.service';
import { UserSettings } from '../../../models/user-settings';
import { RemoteService } from '../../../services/util/remote.service';
import { PresentationEvent } from '../../../models/events/presentation-events.enum';
import { ContentPublishActionType } from '../../../models/content-publish-action.enum';
import { ContentPublishService } from '../../../services/util/content-publish.service';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss'],
})
export class ContentPresentationComponent implements OnInit, OnDestroy {
  @ViewChild(StepperComponent) stepper: StepperComponent;

  isPresentation = false;
  contents: Content[];
  isLoading = true;
  entryIndex = 0;
  contentIndex = 0;
  shortId: string;
  roomId: string;
  contentGroupName: string;
  currentStep = 0;
  infoBarItems: InfoBarItem[] = [];
  answerCount;
  indexChanged: EventEmitter<number> = new EventEmitter<number>();
  contentGroup: ContentGroup;
  remoteSubscription: Subscription;
  groupSubscription: Subscription;
  canAnswerContent = false;
  settings: UserSettings;

  private hotkeyRefs: symbol[] = [];

  constructor(
    protected route: ActivatedRoute,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private router: Router,
    private eventService: EventService,
    private dialogService: DialogService,
    private hotkeyService: HotkeyService,
    private presentationService: PresentationService,
    private userService: UserService,
    private remoteService: RemoteService,
    private contentPublishService: ContentPublishService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.isPresentation = this.route.snapshot.data.isPresentation;
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
    const loginId = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    ).loginId;
    this.userService.getUserSettingsByLoginId(loginId).subscribe((settings) => {
      this.settings = settings || new UserSettings();
      this.route.data.subscribe((data) => {
        this.roomId = data.room.id;
        this.shortId = data.room.shortId;
        this.initGroup(true);
      });
    });
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
    if (this.remoteSubscription) {
      this.remoteSubscription.unsubscribe();
    }
    if (this.groupSubscription) {
      this.groupSubscription.unsubscribe();
    }
  }

  initScale() {
    if (this.isPresentation) {
      const scale = this.presentationService.getScale();
      document.getElementById(
        'stepper-container'
      ).style.transform = `scale(${scale})`;
      document.getElementById(
        'stepper-container'
      ).style.left = `calc(50vw - calc(305px * ${scale})`;
      document.getElementById(
        'stepper-container'
      ).style.top = `calc(4vw - calc(1em * ${scale}))`;
    }
  }

  initPresentation() {
    if (this.isPresentation) {
      this.groupSubscription = this.presentationService
        .getCurrentGroup()
        .subscribe((group) => {
          this.isLoading = true;
          this.contentGroupName = group;
          this.initGroup();
        });
      this.remoteSubscription = this.remoteService
        .getContentState()
        .subscribe((state) => {
          if (this.contentGroup.id === state.contentGroupId) {
            if (this.contents[this.currentStep].id !== state.contentId) {
              const newIndex = this.contents
                .map((c) => c.id)
                .indexOf(state.contentId);
              if (newIndex > -1) {
                this.stepper.onClick(newIndex);
              }
            }
          }
        });
      this.translateService
        .get('control-bar.publish-or-lock-content')
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

  initGroup(initial = false) {
    this.contentGroupService
      .getByRoomIdAndName(this.roomId, this.contentGroupName, true)
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
                setTimeout(() => {
                  this.stepper.init(this.contentIndex, this.contents.length);
                  this.updateURL(this.contentIndex, true);
                  if (this.isPresentation && !initial) {
                    this.updateStateChange();
                  }
                }, 0);
              }
              if (this.infoBarItems.length === 0) {
                this.infoBarItems.push(
                  new InfoBarItem(
                    'content-counter',
                    'people',
                    this.getStepString()
                  )
                );
                this.sendContentStepState();
              } else {
                this.updateInfoBar();
              }
              setTimeout(() => {
                const id = this.isPresentation
                  ? 'presentation-mode-message'
                  : 'presentation-message';
                document.getElementById(id).focus();
              }, 700);
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
      this.initPresentation();
    }
  }

  getStepString(): string {
    return `${this.currentStep + 1} / ${this.contents.length}`;
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
    if (this.isPresentation) {
      this.updateRoute('present', urlIndex);
      this.updateStateChange();
      this.canAnswerContent = ![
        ContentType.SLIDE,
        ContentType.FLASHCARD,
      ].includes(this.contents[this.currentStep].format);
    } else {
      this.updateRoute('edit', urlIndex);
    }
    if (index !== this.entryIndex) {
      this.contentIndex = null;
    }
    this.updateInfoBar();
    setTimeout(() => {
      this.indexChanged.emit(this.currentStep);
      const id =
        [ContentType.SLIDE, ContentType.FLASHCARD].indexOf(
          this.contents[index].format
        ) > -1
          ? 'message-type-info-button'
          : 'message-button';
      document.getElementById(id).focus();
    }, 300);
  }

  updateCounter($event, isActive) {
    if (isActive) {
      this.answerCount = $event;
    }
  }

  updateInfoBar() {
    this.infoBarItems[0].count = this.getStepString();
    this.sendContentStepState();
  }

  updateStateChange() {
    this.remoteService.updateContentStateChange(
      this.contents[this.currentStep].id,
      this.currentStep,
      this.contentGroup.id,
      this.contentGroup.name,
      false,
      false
    );
  }

  sendContentStepState(emptyList = false) {
    let position;
    let step;
    if (!emptyList) {
      step = this.currentStep;
      if (this.currentStep === 0) {
        position = 'START';
      } else if (this.currentStep === this.contents.length - 1) {
        position = 'END';
      }
    }
    const state = {
      position: position,
      index: step,
      content: this.contents[this.currentStep],
    };
    this.eventService.broadcast(PresentationEvent.CONTENT_STATE_UPDATED, state);
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
        if (lastIndex === -1) {
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
        this.eventService.broadcast(
          PresentationEvent.CONTENT_GROUP_UPDATED,
          this.contentGroup
        );
      });
  }
}
