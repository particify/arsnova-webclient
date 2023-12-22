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
import { ContentGroup } from '@app/core/models/content-group';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '@app/core/services/http/user.service';
import { UserSettings } from '@app/core/models/user-settings';
import { Room } from '@app/core/models/room';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss'],
})
export class ContentPresentationComponent implements OnInit, OnDestroy {
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  destroyed$ = new Subject<void>();

  contents: Content[] = [];
  isLoading = true;
  shortId: string;
  room: Room;
  contentGroupName: string;
  currentStep = 0;
  indexChanged: EventEmitter<void> = new EventEmitter<void>();
  contentGroup?: ContentGroup;
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
    private userService: UserService
  ) {
    this.contentGroupName = route.snapshot.params['seriesName'];
    this.currentStep = route.snapshot.params['contentIndex'] - 1;
    this.room = route.snapshot.data.room;
    this.shortId = route.snapshot.data.room.shortId;
  }

  ngOnInit() {
    const loginId = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    ).loginId;
    this.userService.getUserSettingsByLoginId(loginId).subscribe((settings) => {
      if (settings) {
        this.settings = settings;
      }
      this.initGroup();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updateURL(index: number) {
    if (this.currentStep === index) {
      return;
    }
    this.currentStep = index;
    this.updateRoute(this.currentStep + 1);
    setTimeout(() => {
      this.indexChanged.emit();
    }, 300);
  }

  private initGroup() {
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
              this.stepCount = this.contents.length;
              this.contentGroupService
                .getAttributions(this.room.id, group.id)
                .pipe(takeUntil(this.destroyed$))
                .subscribe((attributions) => {
                  if (attributions.length > 0) {
                    this.attributions = attributions;
                    this.stepCount++;
                  }
                  this.isLoading = false;
                  setTimeout(() => {
                    this.stepper.init(this.currentStep, this.stepCount);
                  }, 0);
                });
            });
        } else {
          this.isLoading = false;
        }
      });
  }

  private updateRoute(index: number) {
    const urlTree = this.router.createUrlTree([
      'edit',
      this.shortId,
      'series',
      this.contentGroupName,
      index,
    ]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
