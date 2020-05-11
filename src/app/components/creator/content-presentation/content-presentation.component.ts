import { ContentChoice } from '../../../models/content-choice';
import { ContentService } from '../../../services/http/content.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { StepperComponent } from '../../shared/stepper/stepper.component';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss']
})
export class ContentPresentationComponent implements OnInit {


  @ViewChild(StepperComponent) stepper: StepperComponent;

  contents: ContentChoice[];

  labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  isLoading = true;
  shortId: string;
  groupName: string;

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private globalStorageService: GlobalStorageService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params['contentGroup'];
      this.shortId = params['shortId'];
    });
    this.route.data.subscribe(data => {
      this.roomService.getGroupByRoomIdAndName(data.room.id, this.groupName).subscribe(group => {
        this.contentService.getContentChoiceByIds(group.contentIds).subscribe(contents => {
          this.contents = contents;
          this.checkIfLastContentExists();
          this.isLoading = false;
        });
      });
    });
  }

  goToStats(contentId: string) {
    this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_CONTENT, contentId);
    this.router.navigate([`/creator/room/${this.shortId}/group/${this.groupName}/statistics/${contentId}`]);
  }

  checkIfLastContentExists() {
    const lastContentId = this.globalStorageService.getMemoryItem(MemoryStorageKey.LAST_CONTENT);
    if (lastContentId) {
      this.globalStorageService.deleteMemoryStorageItem(MemoryStorageKey.LAST_CONTENT);
      const contentIndex = this.contents.map(function (content) {
        return content.id;
      }).indexOf(lastContentId);
      setTimeout(() => {
        this.stepper.init(contentIndex, this.contents.length);
      }, 100);
    }
  }
}
