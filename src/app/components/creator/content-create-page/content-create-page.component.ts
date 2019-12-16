import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentGroup } from '../../../models/content-group';
import { ContentText } from '../../../models/content-text';
import { FormControl } from '@angular/forms';
import { EventService } from '../../../services/util/event.service';

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-create-page.component.html',
  styleUrls: ['./content-create-page.component.scss']
})
export class ContentCreatePageComponent implements OnInit {

  contentGroups: string[] = [];
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
              protected langService: LanguageService,
              public eventService: EventService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(sessionStorage.getItem('currentLang'));
    const group: ContentGroup = JSON.parse(sessionStorage.getItem('contentGroup'));
    this.translateService.get('content.contents-without-collection').subscribe(emptyGroupName => {
      this.lastCollection = group.name !== emptyGroupName ? group : null;
    });
    this.getGroups();

  }

  getGroups(): void {
    this.contentGroups = JSON.parse(sessionStorage.getItem('contentGroups'));
  }

  resetInputs() {
    this.content.subject = '';
    this.content.body = '';
  }
}
