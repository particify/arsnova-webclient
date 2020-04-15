import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { User } from '../../../models/user';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { DialogService } from '../../../services/util/dialog.service';
import { RoomService } from '../../../services/http/room.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit, AfterContentInit {
  user: User;
  selectedFile: File;
  jsonToUpload: JSON;

    constructor(
    private dialogService: DialogService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private authenticationService: AuthenticationService,
    private eventService: EventService,
    private liveAnnouncer: LiveAnnouncer,
    private roomService: RoomService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && this.eventService.focusOnInput === false) {
      document.getElementById('create-session-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && this.eventService.focusOnInput === false) {
      document.getElementById('session-id-input').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && this.eventService.focusOnInput === false) {
      document.getElementById('room-list').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape, KeyboardKey.Digit9) === true &&
      this.eventService.focusOnInput === false) {
      this.announce();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('user-message').focus();
    }, 500);
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    this.authenticationService.watchUser.subscribe(newUser => this.user = newUser);
  }

  public announce() {
    this.liveAnnouncer.clear();
    this.translateService.get('home-page.a11y-user-keys').subscribe(msg => {
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, "UTF-8");
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        const parsed = JSON.parse(fileReader.result);
        this.jsonToUpload = parsed.exportData;
        console.log(this.jsonToUpload);
        console.log(parsed);
      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }
  }

  onUpload() {
    this.roomService.importv2Room(this.jsonToUpload).subscribe(result => {
      console.log(result);
    });
  // upload code goes here
  }
}
