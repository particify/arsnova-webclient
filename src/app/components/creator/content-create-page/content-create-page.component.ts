import { AfterContentInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentGroup } from '../../../models/content-group';
import { ContentText } from '../../../models/content-text';
import { FormControl } from '@angular/forms';
import { EventService } from '../../../services/util/event.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-create-page.component.html',
  styleUrls: ['./content-create-page.component.scss']
})
export class ContentCreatePageComponent implements OnInit, AfterContentInit {

  contentGroups: string[] = [];
  lastCollection: ContentGroup;

  content: ContentText = new ContentText(
    '1',
    '1',
    '0',
    '',
    '',
    [],
    null
  );

  myControl = new FormControl();

  constructor(private translateService: TranslateService,
              protected langService: LanguageService,
              public eventService: EventService,
              private liveAnnouncer: LiveAnnouncer) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  static saveGroupInSessionStorage(newGroup: string): boolean {
    if (newGroup !== '') {
      sessionStorage.setItem('lastGroup',
        JSON.stringify(new ContentGroup('', '', newGroup, [], true)));
      const groups: string [] = JSON.parse(sessionStorage.getItem('contentGroups')) || [];
      if (groups) {
        for (let i = 0; i < groups.length; i++) {
          if (newGroup === groups[i]) {
            return false;
          }
        }
      }
      groups.push(newGroup);
      sessionStorage.setItem('contentGroups', JSON.stringify(groups));
      return true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('subject-input').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('format-info-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      document.getElementById('keys-announcer-button').focus();
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('message-announcer-button').focus();
    }, 700);
    this.eventService.makeFocusOnInputFalse();
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    const lastGroup: ContentGroup = JSON.parse(sessionStorage.getItem('lastGroup'));
    this.translateService.get('content.default-group').subscribe(defaultGroup => {
      this.lastCollection = lastGroup ? lastGroup.name : defaultGroup;
    });
    this.getGroups();
  }

  announce() {
    this.liveAnnouncer.clear();
    this.translateService.get('content.a11y-content-create-keys').subscribe(msg => {
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

  getGroups(): void {
    this.contentGroups = JSON.parse(sessionStorage.getItem('contentGroups'));
  }

  resetInputs() {
    this.content.subject = '';
    this.content.body = '';
  }
}
