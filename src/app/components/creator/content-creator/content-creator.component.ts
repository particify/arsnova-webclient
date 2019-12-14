import { Component, Input, OnInit } from '@angular/core';
import { ContentText } from '../../../models/content-text';
import { FormControl } from '@angular/forms';
import { Room } from '../../../models/room';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ContentGroup } from '../../../models/content-group';

@Component({
  selector: 'app-content-creator',
  templateUrl: './content-creator.component.html',
  styleUrls: ['./content-creator.component.scss']
})
export class ContentCreatorComponent implements OnInit {
  @Input() format;
  @Input() contentGroups;

  room: Room;

  lastCollection: ContentGroup;

  content: ContentText = new ContentText(
    '1',
    '1',
    '0',
    '',
    '',
    1,
    [],
  );

  myControl = new FormControl();

  constructor(private translateService: TranslateService,
              public eventService: EventService) {
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    const group: ContentGroup = JSON.parse(sessionStorage.getItem('contentGroup'));
    this.translateService.get('content.contents-without-collection').subscribe(emptyGroupName => {
      this.lastCollection = group.name !== emptyGroupName ? group : null;
    });
  }

  resetInputs() {
    this.content.subject = '';
    this.content.body = '';
  }
}
