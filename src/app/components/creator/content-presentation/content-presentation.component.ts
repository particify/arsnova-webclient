import { ContentChoice } from '../../../models/content-choice';
import { ContentService } from '../../../services/http/content.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss']
})
export class ContentPresentationComponent implements OnInit {

  contents: ContentChoice[];
  labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  isLoading = true;

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {
  }

  ngOnInit() {
    let groupName;
    this.route.params.subscribe(params => {
      groupName = params['contentGroup'];
    });
    this.route.data.subscribe(data => {
      this.roomService.getGroupByRoomIdAndName(data.room.id, groupName).subscribe(group => {
        this.contentService.getContentChoiceByIds(group.contentIds).subscribe(contents => {
          this.contents = contents;
          this.isLoading = false;
        });
      });
    });
  }
}
