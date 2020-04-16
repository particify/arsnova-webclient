import { ContentChoice } from '../../../models/content-choice';
import { ContentService } from '../../../services/http/content.service';
import { ContentGroup } from '../../../models/content-group';
import { Component, OnInit } from '@angular/core';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-content-presentation',
  templateUrl: './content-presentation.component.html',
  styleUrls: ['./content-presentation.component.scss']
})
export class ContentPresentationComponent implements OnInit {

  contents: ContentChoice[];
  contentGroup: ContentGroup;
  labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  isLoading = true;

  constructor(
    private contentService: ContentService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit(
  ) {
    this.contentGroup = this.globalStorageService.getMemoryItem(MemoryStorageKey.LAST_GROUP);
    this.contentService.getContentChoiceByIds(this.contentGroup.contentIds).subscribe(contents => {
      this.contents = contents;
      this.isLoading = false;
    });
  }

}
