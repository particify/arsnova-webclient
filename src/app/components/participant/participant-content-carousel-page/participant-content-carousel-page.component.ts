import { Component, OnInit } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  styleUrls: ['./participant-content-carousel-page.component.scss']
})
export class ParticipantContentCarouselPageComponent implements OnInit {
  ContentType: typeof ContentType = ContentType;

  contents: Content[];
  contentGroup: ContentGroup;
  isLoading = true;
  alreadySent = new Map<number, boolean>();

  constructor(private contentService: ContentService) {
  }

  ngOnInit() {
    this.contentGroup = JSON.parse(sessionStorage.getItem('lastGroup'));
    this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
      this.contents = contents;
      this.isLoading = false;
    });
  }

  receiveSentStatus($event, index: number) {
    this.alreadySent.set(index, $event);
  }
}
