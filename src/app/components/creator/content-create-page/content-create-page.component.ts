import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentText } from '../../../models/content-text';
import { FormControl } from '@angular/forms';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-create-page.component.html',
  styleUrls: ['./content-create-page.component.scss']
})
export class ContentCreatePageComponent implements OnInit, AfterContentInit {

  contentGroups: string[] = [];
  lastCollection: string;

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
    this.route.data.subscribe(data => {
      // this refreshes memory storage
      this.roomService.getStats(data.room.id).subscribe(stats => {
        if (stats.groupStats) {
          this.contentGroups = stats.groupStats.map(stat => stat.groupName);
          const lastGroup = this.globalStorageService.getMemoryItem(MemoryStorageKey.LAST_GROUP);
          this.lastCollection = lastGroup ? lastGroup : this.contentGroups[0];
        } else {
          this.contentGroups = [];
          this.translateService.get('content.default-group').subscribe(defaultGroup => {
            this.lastCollection = defaultGroup;
          });
        }
      });
    });
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
  }

  announce() {
    this.announceService.announce('content.a11y-content-create-keys');
  }

  resetInputs() {
    this.content.subject = '';
    this.content.body = '';
  }
}
