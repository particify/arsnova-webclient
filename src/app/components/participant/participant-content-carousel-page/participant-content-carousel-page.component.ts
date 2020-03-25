import { Component, OnInit, ViewChild } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';
import { TranslateService } from '@ngx-translate/core';
import { StepperComponent } from '../stepper/stepper.component';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { RoomService } from '../../../services/http/room.service';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  styleUrls: ['./participant-content-carousel-page.component.scss']
})
export class ParticipantContentCarouselPageComponent implements OnInit {

  @ViewChild(StepperComponent) stepper: StepperComponent;

  ContentType: typeof ContentType = ContentType;

  contents: Content[] = [];
  contentGroup: ContentGroup;
  contentGroupName: string;
  shortId: string;
  isLoading = true;
  alreadySent = new Map<number, boolean>();
  startIndex = 0;
  started = false;

  constructor(
    private contentService: ContentService,
    protected translateService: TranslateService,
    protected roomService: RoomService,
    protected route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    this.route.params.subscribe(params => {
      this.contentGroupName = params['contentGroup'];
      this.shortId = params['shortId'];
      this.roomService.getGroupByRoomIdAndName('~' + this.shortId, this.contentGroupName).subscribe(contentGroup => {
        this.contentGroup = contentGroup;
        this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
          for (const content of contents) {
            if (content.state.visible) {
              this.contents.push(content);
            }
          }
          this.isLoading = false;
        });
      });
    });
  }

  receiveSentStatus($event, index: number) {
    this.alreadySent.set(index, $event);
    if (!this.started) {
      if (this.alreadySent.size === this.contents.length) {
        for (let i = 0; i < this.alreadySent.size; i++) {
          if (this.alreadySent.get(i) === false) {
            this.startIndex = i;
            this.stepper.onClick(this.startIndex);
            if (this.startIndex > 2) {
              this.stepper.headerPos = this.startIndex - (this.startIndex < this.contents.length - 2 ? 2 : 4);
              this.stepper.moveHeaderRight();
            }
            this.started = true;
            break;
          }
        }
      }
    } else {
      setTimeout(() => {
        this.stepper.next();
      }, 500);
    }
  }
}
