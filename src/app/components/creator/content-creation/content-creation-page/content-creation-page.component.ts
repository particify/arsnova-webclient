import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { FormControl } from '@angular/forms';
import { EventService } from '../../../../services/util/event.service';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { KeyboardKey } from '../../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../../services/http/room.service';
import { AnnounceService } from '../../../../services/util/announce.service';
import { Subject } from 'rxjs';

class ContentFormat {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-creation-page.component.html',
  styleUrls: ['./content-creation-page.component.scss']
})

export class ContentCreationPageComponent implements OnInit, AfterContentInit {

  createEventSubject: Subject<void> = new Subject<void>();
  question: string;
  contentGroups: string[] = [];
  lastContentGroup: string;
  formats: ContentFormat[] = [
    { name: 'choice', icon: 'format_list_bulleted' },
    { name: 'likert', icon: 'mood' },
    { name: 'binary', icon: 'dns' },
    { name: 'text', icon: 'description' }
  ];
  selectedFormat: ContentFormat = this.formats[0];

  myControl = new FormControl();

  constructor(
    private translateService: TranslateService,
    protected langService: LanguageService,
    public eventService: EventService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    private roomService: RoomService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('body-input').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      document.getElementById('format-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('group-input').focus();
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
    this.route.data.subscribe(data => {
      // this refreshes memory storage
      this.roomService.getStats(data.room.id).subscribe(stats => {
        if (stats.groupStats) {
          this.contentGroups = stats.groupStats.map(stat => stat.groupName);
          const lastGroup = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
          this.lastContentGroup = lastGroup ? lastGroup : this.contentGroups[0];
        } else {
          this.contentGroups = [];
          this.translateService.get('content.default-group').subscribe(defaultGroup => {
            this.lastContentGroup = defaultGroup;
          });
        }
      });
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  announce() {
    this.announceService.announce('content.a11y-content-create-shortcuts');
  }

  resetInputs() {
    this.question = '';
  }

  changeFormat(format: ContentFormat) {
    this.selectedFormat = format;
  }

  emitCreateEvent() {
    this.createEventSubject.next();
  }
}
