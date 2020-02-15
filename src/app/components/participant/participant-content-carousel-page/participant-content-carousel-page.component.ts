import { Component, OnInit } from '@angular/core';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentGroup } from '../../../models/content-group';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  styleUrls: ['./participant-content-carousel-page.component.scss']
})
export class ParticipantContentCarouselPageComponent implements OnInit {
  ContentType: typeof ContentType = ContentType;

  contents: Content[] = [];
  contentGroup: ContentGroup;
  isLoading = true;
  alreadySent = new Map<number, boolean>();

  constructor(private contentService: ContentService,
              protected translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    this.contentGroup = JSON.parse(sessionStorage.getItem('lastGroup'));
    this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
      for (const content of contents) {
        if (content.state.visible) {
          this.contents.push(content);
        }
      }
      this.isLoading = false;
    });
  }

  receiveSentStatus($event, index: number) {
    this.alreadySent.set(index, $event);
  }
}
