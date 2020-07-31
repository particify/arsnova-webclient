import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { Router } from '@angular/router';
import { RegisterErrorStateMatcher } from '../../home/register/register.component';
import { FormControl, Validators } from '@angular/forms';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { UserRole } from '../../../models/user-roles.enum';
import { User } from '../../../models/user';
import { Moderator } from '../../../models/moderator';
import { ModeratorService } from '../../../services/http/moderator.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-room-join',
  templateUrl: './room-join.component.html',
  styleUrls: ['./room-join.component.scss']
})
export class RoomJoinComponent implements OnInit {
  @ViewChild('roomCode', { static: true }) roomCodeElement: ElementRef;
  @Input() inputA11yString: string;

  room: Room;
  user: User;
  joinHover: boolean;
  isDesktop: boolean;

  roomCodeFormControl = new FormControl('', [Validators.pattern('[0-9 ]*')]);
  matcher = new RegisterErrorStateMatcher();

  constructor(
    private roomService: RoomService,
    private router: Router,
    public notificationService: NotificationService,
    private translateService: TranslateService,
    public authenticationService: AuthenticationService,
    private moderatorService: ModeratorService,
    public eventService: EventService,
    private globalStorageService: GlobalStorageService
  ) {
    this.isDesktop = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE) === 'desktop';
  }

  ngOnInit() {
    this.authenticationService.watchUser.subscribe(newUser => this.user = newUser);
  }

  toggleArrowAnimation(shortId: string, animation: boolean) {
    if (shortId.length === 9) {
      this.joinHover = animation;
    }
  }

  onEnter() {
    this.getRoom(this.roomCodeElement.nativeElement.value);
  }

  getRoom(id: string): void {
    if (id.length - (id.split(' ').length - 1) < 8) {
      this.translateService.get('home-page.exactly-8').subscribe(message => {
        this.notificationService.show(message);
      });
    } else if (this.roomCodeFormControl.hasError('pattern')) {
      this.translateService.get('home-page.only-numbers').subscribe(message => {
        this.notificationService.show(message);
      });
    } else {
      const roomId = id.replace(/\s/g, '');
      this.roomService.getRoomByShortId(roomId).subscribe(room => {
          this.room = room;
          if (!this.user) {
            this.guestLogin();
          } else {
            this.addAndNavigate();
          }
        },
        error => {
          this.translateService.get('home-page.no-room-found').subscribe(message => {
            this.notificationService.show(message);
          });
        });
    }
  }

  joinRoom(id: string): void {
    if (!this.roomCodeFormControl.hasError('required') && !this.roomCodeFormControl.hasError('minlength')) {
      this.getRoom(id);
    }
  }

  guestLogin() {
    this.authenticationService.guestLogin(UserRole.PARTICIPANT).subscribe(loggedIn => {
      if (loggedIn === 'true') {
        this.addAndNavigate();
      }
    });
  }

  addAndNavigate() {
    if (this.user.id === this.room.ownerId) {
      this.router.navigate([`/creator/room/${this.room.shortId}`]);
    } else {
      this.roomService.addToHistory(this.room.id);
      this.moderatorService.get(this.room.id).subscribe((moderators: Moderator[]) => {
        let isModerator = false;
        for (const m of moderators) {
          if (m.userId === this.user.id) {
            this.router.navigate([`/moderator/room/${this.room.shortId}`]);
            isModerator = true;
          }
        }
        if (!isModerator) {
          this.router.navigate([`/participant/room/${this.room.shortId}`]);
        }
      });
    }
  }


  /**
   * Prettifies the room code input element which:
   *
   * - casts a 'xxxx xxxx' layout to the input field
   */
  prettifyRoomCode(keyboardEvent: KeyboardEvent): void {
    const roomCode: string = this.roomCodeElement.nativeElement.value;
    const isBackspaceKeyboardEvent: boolean = KeyboardUtils.isKeyEvent(keyboardEvent, KeyboardKey.Backspace);
    const selectedText = window.getSelection();
    const isSelected: boolean = roomCode === selectedText.toString();

    if (!isSelected) {
      // allow only backspace key press after all 8 digits were entered by the user
      if (roomCode.length - (roomCode.split(' ').length - 1) === 8 && isBackspaceKeyboardEvent === false) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
      } else if (roomCode.length === 4 && isBackspaceKeyboardEvent === false) { // add a space between each 4 digit group
        this.roomCodeElement.nativeElement.value += ' ';
      }
    }
  }
}
